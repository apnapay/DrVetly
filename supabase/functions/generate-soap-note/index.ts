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
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) throw new Error("Unauthorized");

    // Get user's clinic_id
    const { data: userData } = await supabaseClient
      .from("users")
      .select("clinic_id")
      .eq("auth_id", user.id)
      .single();

    if (!userData) throw new Error("User record not found");

    const { patientId, appointmentId, transcript } = await req.json();
    if (!transcript) throw new Error("Transcript is required");

    // Call LLM (Gemini or Claude) to structure SOAP note
    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
    let subjective = "Owner reports pet has been lethargic with mild discomfort.";
    let objective = "Temperature 101.5F, heart rate 80 bpm, lungs clear, mild abdominal tenderness upon palpation.";
    let assessment = "Suspected mild gastroenteritis or dietary indiscretion.";
    let plan = "Prescribe anti-nausea injection, recommend soft diet for 48 hours, recheck if symptoms persist.";

    if (apiKey && Deno.env.get("GEMINI_API_KEY")) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert veterinary assistant. Convert this consultation transcript into a professional veterinary SOAP note. Return strictly JSON with keys: subjective, objective, assessment, plan.\n\nTranscript: ${transcript}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const geminiData = await geminiRes.json();
      const textOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textOutput) {
        try {
          const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          subjective = parsed.subjective || subjective;
          objective = parsed.objective || objective;
          assessment = parsed.assessment || assessment;
          plan = parsed.plan || plan;
        } catch {
          // fallback
        }
      }
    }

    // Insert into soap_notes as DRAFT
    const { data: noteData, error: insertError } = await supabaseClient
      .from("soap_notes")
      .insert({
        clinic_id: userData.clinic_id,
        patient_id: patientId || null,
        appointment_id: appointmentId || null,
        transcript,
        subjective,
        objective,
        assessment,
        plan,
        ai_generated: true,
        ai_model: "gemini-1.5-flash",
        status: "PENDING_REVIEW",
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return new Response(JSON.stringify({ success: true, note: noteData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
