import express from "express";
import {
  createChat,
  deleteChat,
  getChat,
  listChats,
  sendMessage
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(listChats).post(createChat);
router.route("/:id").get(getChat).delete(deleteChat);
router.post("/:id/messages", sendMessage);

export default router;
