import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, password, clinicName, vetName, plan = "basic" } = await req.json();

    if (!email || !password || !clinicName || !vetName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create auth user");
    }

    const userId = authData.user.id;
    const slug = clinicName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    // 2. Create clinic record
    const { data: clinicData, error: clinicError } = await supabaseAdmin
      .from("clinics")
      .insert({
        name: clinicName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        plan: plan.toUpperCase(),
        subscription_status: "trialing",
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (clinicError || !clinicData) {
      throw new Error(clinicError?.message || "Failed to create clinic");
    }

    // 3. Create staff user record
    const nameParts = vetName.trim().split(" ");
    const firstName = nameParts[0] || "Vet";
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    const { error: userError } = await supabaseAdmin.from("users").insert({
      auth_id: userId,
      clinic_id: clinicData.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "ADMIN",
      active: true,
    });

    if (userError) {
      throw new Error(userError.message || "Failed to create user record");
    }

    return new Response(JSON.stringify({ success: true, userId, clinicId: clinicData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
