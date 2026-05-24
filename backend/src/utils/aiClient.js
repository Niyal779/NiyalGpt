import axios from "axios";

function toGeminiContents(messages) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content?.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));
}

export async function generateAssistantReply({ messages, personality }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to backend/.env and restart the server.");
  }

  const contents = toGeminiContents(messages);

  if (contents.length === 0) {
    throw new Error("At least one user message is required.");
  }

  let response;

  try {
    response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        systemInstruction: {
          parts: [
            {
              text: `You are NiyalGPT, a real AI chatbot created for Niyal Rahaman. Follow this personality: ${personality || "Helpful, clear, and professional."}`
            }
          ]
        },
        contents,
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        timeout: 45000
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Gemini API request failed.";
      throw new Error(message);
    }

    throw error;
  }

  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
