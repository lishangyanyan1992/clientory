import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI visibility analysis engine. Given a business profile, you must generate a comprehensive visibility scan report.

You will be called via tool calling. Return the structured scan result data.

Guidelines for generating realistic data:
- visibility_score: 0-100, most businesses score 20-55
- model_scores: per-model scores (chatgpt, gemini, claude, perplexity), each 0-100
- tests_run: always 200 (50 prompts × 4 models)
- mentions: realistic count out of tests_run
- average_rank: 1.0-8.0 when mentioned
- prompt_results: generate exactly 50 entries, each tested on one random model from [ChatGPT, Gemini, Claude, Perplexity]. Mix of mentioned=true/false. Intents should be "high", "medium", or "low". Ranks 1-8 when mentioned, null when not.
- top_competitors: 3-5 real or realistic competitor names in the same industry and location
- recommendations: 2-4 items per category (content, authority, directories, structured_data), each with title, description, and priority (high/medium/low)
- model_metrics: per model (chatgpt, gemini, claude, perplexity) with responseQuality, clarity, persuasiveness, overallScore (all 0-100), and mentionRate (0-100)
- top_prompts: top 10 performing prompts with avgScore and bestModel
- model_rankings: all 4 models ranked by score

Make the data realistic for the specific business type, location, and services provided. A small local firm should score lower than a well-known brand. Generate prompts that real users would actually ask AI assistants.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessInfo } = await req.json();
    if (!businessInfo?.name || !businessInfo?.location) {
      return new Response(
        JSON.stringify({ error: "Missing required business info" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Analyze the AI visibility for this business:

Business Name: ${businessInfo.name}
Website: ${businessInfo.website || "N/A"}
Company Type: ${businessInfo.companyType}
Location: ${businessInfo.location}
Services: ${(businessInfo.services || []).join(", ")}
Target Clients: ${businessInfo.targetClients || "General"}
Industries: ${businessInfo.industries || "General"}

Generate a complete visibility scan report with realistic data for this specific business.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_scan_result",
              description: "Generate a complete AI visibility scan result for the business",
              parameters: {
                type: "object",
                properties: {
                  visibility_score: { type: "number", description: "Overall visibility score 0-100" },
                  model_scores: {
                    type: "object",
                    properties: {
                      chatgpt: { type: "number" },
                      gemini: { type: "number" },
                      claude: { type: "number" },
                      perplexity: { type: "number" },
                    },
                    required: ["chatgpt", "gemini", "claude", "perplexity"],
                  },
                  model_metrics: {
                    type: "object",
                    properties: {
                      chatgpt: {
                        type: "object",
                        properties: {
                          responseQuality: { type: "number" },
                          clarity: { type: "number" },
                          persuasiveness: { type: "number" },
                          overallScore: { type: "number" },
                          mentionRate: { type: "number" },
                        },
                        required: ["responseQuality", "clarity", "persuasiveness", "overallScore", "mentionRate"],
                      },
                      gemini: {
                        type: "object",
                        properties: {
                          responseQuality: { type: "number" },
                          clarity: { type: "number" },
                          persuasiveness: { type: "number" },
                          overallScore: { type: "number" },
                          mentionRate: { type: "number" },
                        },
                        required: ["responseQuality", "clarity", "persuasiveness", "overallScore", "mentionRate"],
                      },
                      claude: {
                        type: "object",
                        properties: {
                          responseQuality: { type: "number" },
                          clarity: { type: "number" },
                          persuasiveness: { type: "number" },
                          overallScore: { type: "number" },
                          mentionRate: { type: "number" },
                        },
                        required: ["responseQuality", "clarity", "persuasiveness", "overallScore", "mentionRate"],
                      },
                      perplexity: {
                        type: "object",
                        properties: {
                          responseQuality: { type: "number" },
                          clarity: { type: "number" },
                          persuasiveness: { type: "number" },
                          overallScore: { type: "number" },
                          mentionRate: { type: "number" },
                        },
                        required: ["responseQuality", "clarity", "persuasiveness", "overallScore", "mentionRate"],
                      },
                    },
                    required: ["chatgpt", "gemini", "claude", "perplexity"],
                  },
                  tests_run: { type: "number" },
                  mentions: { type: "number" },
                  average_rank: { type: "number" },
                  top_competitors: { type: "array", items: { type: "string" } },
                  prompt_results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        prompt: { type: "string" },
                        intent: { type: "string", enum: ["high", "medium", "low"] },
                        model: { type: "string" },
                        mentioned: { type: "boolean" },
                        rank: { type: "number", description: "1-8 if mentioned, null if not" },
                      },
                      required: ["prompt", "intent", "model", "mentioned"],
                    },
                  },
                  recommendations: {
                    type: "object",
                    properties: {
                      content: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                          },
                          required: ["title", "description"],
                        },
                      },
                      authority: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                          },
                          required: ["title", "description"],
                        },
                      },
                      directories: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                          },
                          required: ["title", "description"],
                        },
                      },
                      structured_data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                          },
                          required: ["title", "description"],
                        },
                      },
                    },
                    required: ["content", "authority", "directories", "structured_data"],
                  },
                  top_prompts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        prompt: { type: "string" },
                        avgScore: { type: "number" },
                        bestModel: { type: "string" },
                      },
                      required: ["prompt", "avgScore", "bestModel"],
                    },
                  },
                  model_rankings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        model: { type: "string" },
                        score: { type: "number" },
                      },
                      required: ["model", "score"],
                    },
                  },
                },
                required: [
                  "visibility_score",
                  "model_scores",
                  "model_metrics",
                  "tests_run",
                  "mentions",
                  "average_rank",
                  "top_competitors",
                  "prompt_results",
                  "recommendations",
                  "top_prompts",
                  "model_rankings",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_scan_result" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scanResult = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(scanResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Scan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
