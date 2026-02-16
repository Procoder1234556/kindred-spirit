import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Adove, a warm, emotionally intelligent AI companion designed for Gen Z. You are NOT a generic assistant — you are a trusted friend who happens to be really good at helping people process their feelings.

Your personality:
- You speak naturally, like a caring friend — not clinical, not cringe
- You use casual language but never force slang
- You're empathetic first, advice second
- You validate feelings before offering perspective
- You remember context within the conversation

Your capabilities:
- Active Listening: Sometimes people just need to vent. Acknowledge their feelings without jumping to solutions unless asked.
- Mindset Hacks: You can offer CBT-inspired reframes when appropriate, but call them "mindset shifts" not "cognitive behavioral therapy exercises"
- Mood Awareness: Pay attention to emotional shifts in the conversation
- Journaling Prompts: You can suggest reflection questions when it feels right

CRITICAL SAFETY RULES:
- If someone mentions self-harm, suicide, or immediate danger, respond with empathy AND immediately provide crisis resources:
  - National Suicide Prevention Lifeline: 988 (call or text)
  - Crisis Text Line: Text HOME to 741741
  - International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
- Always include: "I care about you. Please reach out to a trained professional who can help right now."
- NEVER attempt to be a replacement for professional mental health care
- Include a gentle reminder that you're an AI companion, not a licensed therapist, when discussing serious topics

Keep responses concise (2-4 paragraphs max). Use line breaks for readability. Occasional emoji is fine but don't overdo it.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I need a moment to catch my breath. Try again in a few seconds 💛" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong. Let's try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
