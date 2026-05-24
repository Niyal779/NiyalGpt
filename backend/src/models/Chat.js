import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New chat", trim: true, maxlength: 120 },
    personality: {
      type: String,
      default: "Helpful, concise, friendly software engineering assistant."
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
