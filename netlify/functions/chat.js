exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { message: "Only POST requests are allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return jsonResponse(500, {
      message: "GEMINI_API_KEY is missing in Netlify environment variables."
    });
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch (_error) {
    return jsonResponse(400, { message: "Invalid JSON request body." });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const personality = body.personality || "Helpful, clear, and professional.";
  const contents = messages
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content?.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

  if (contents.length === 0) {
    return jsonResponse(400, { message: "At least one user message is required." });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are NiyalGPT, a real AI chatbot created for Niyal Rahaman. Follow this personality: ${personality}`
              }
            ]
          },
          contents,
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return jsonResponse(geminiResponse.status, {
        message: data.error?.message || "Gemini API request failed."
      });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return jsonResponse(502, { message: "Gemini returned an empty response." });
    }

    return jsonResponse(200, { reply });
  } catch (error) {
    return jsonResponse(502, {
      message: error.message || "Could not connect to Gemini API."
    });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}
