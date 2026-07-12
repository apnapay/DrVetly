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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { type, plan, invoiceId, amountCents } = await req.json();
    const creemApiKey = Deno.env.get("CREEM_API_KEY");
    const appUrl = Deno.env.get("APP_URL") || "https://ais-dev-d2b4xaxscg2uscjuo472mj-657080732106.asia-southeast1.run.app";

    // Call Creem.io API for checkout session creation
    let productId = "";
    if (plan === "solo") productId = Deno.env.get("CREEM_PRODUCT_BASIC") || "prod_solo";
    if (plan === "hyper") productId = Deno.env.get("CREEM_PRODUCT_PRO") || "prod_hyper";

    const creemPayload: any = {
      mode: type === "subscription" ? "subscription" : "payment",
      success_url: `${appUrl}/dashboard/settings?checkout=success`,
      fail_url: `${appUrl}/dashboard/settings?checkout=canceled`,
      metadata: { userId: user.id },
    };

    if (type === "subscription") {
      creemPayload.product_id = productId;
    } else {
      creemPayload.line_items = [
        {
          name: `Invoice Payment #${invoiceId}`,
          amount: amountCents,
          currency: "USD",
          quantity: 1,
        },
      ];
      creemPayload.metadata.invoiceId = invoiceId;
    }

    const creemRes = await fetch("https://api.creem.io/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": creemApiKey ?? "",
      },
      body: JSON.stringify(creemPayload),
    });

    const creemData = await creemRes.json();
    if (!creemRes.ok) {
      throw new Error(creemData.error || "Failed to create Creem checkout session");
    }

    return new Response(JSON.stringify({ checkoutUrl: creemData.checkout_url || creemData.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
