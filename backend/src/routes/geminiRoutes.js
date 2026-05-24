import express from "express";
import { generateAssistantReply } from "../utils/aiClient.js";

const router = express.Router();

router.post("/chat", async (req, res, next) => {
  try {
    const { messages, personality } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages are required." });
    }

    const hasUserMessage = messages.some(
      (message) => message?.role === "user" && typeof message.content === "string" && message.content.trim()
    );

    if (!hasUserMessage) {
      return res.status(400).json({ message: "A user message is required." });
    }

    const reply = await generateAssistantReply({ messages, personality });
    res.json({ reply });
  } catch (error) {
    next(error);
  }
});

export default router;
