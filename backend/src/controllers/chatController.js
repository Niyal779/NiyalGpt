import { Chat } from "../models/Chat.js";
import { generateAssistantReply } from "../utils/aiClient.js";

export async function listChats(req, res, next) {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select("title personality updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    next(error);
  }
}

export async function getChat(req, res, next) {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.json({ chat });
  } catch (error) {
    next(error);
  }
}

export async function createChat(req, res, next) {
  try {
    const { message, personality } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required." });

    const title = message.trim().slice(0, 64);
    const chat = await Chat.create({
      user: req.user._id,
      title,
      personality: personality || undefined,
      messages: [{ role: "user", content: message.trim() }]
    });

    const reply = await generateAssistantReply({
      messages: chat.messages,
      personality: chat.personality
    });

    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.status(201).json({ chat });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { message, personality } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required." });

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found." });

    if (personality) chat.personality = personality;
    chat.messages.push({ role: "user", content: message.trim() });

    const reply = await generateAssistantReply({
      messages: chat.messages,
      personality: chat.personality
    });

    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.json({ chat });
  } catch (error) {
    next(error);
  }
}

export async function deleteChat(req, res, next) {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.json({ message: "Chat deleted." });
  } catch (error) {
    next(error);
  }
}
