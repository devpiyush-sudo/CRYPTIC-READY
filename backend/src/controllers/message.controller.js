import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

export async function getUsersForSidebar(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-clerkId")
      .sort({ fullName: 1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const me = req.user._id;

    const conversations = await Message.aggregate([
      // 1. only messages I sent or received
      { $match: { $or: [{ senderId: me }, { receiverId: me }] } },
      // 2. one row per chat partner with the time of our latest message
      {
        $group: {
          _id: { $cond: [{ $eq: ["$senderId", me] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. most recent conversation first
      { $sort: { lastMessageAt: -1 } },
      // 4. attach the partner's profile
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      // 5. drop partners whose account no longer exists, then make the profile the document
      { $match: { "user.0": { $exists: true } } },
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. never expose clerkId
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!isValidId(userToChatId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!isValidId(receiverId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (String(receiverId) === String(senderId)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }
    if (!text && !req.file) {
      return res.status(400).json({ message: "Message is empty" });
    }
    if (text.length > 4000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    let image;
    let video;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(503).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) video = url;
      else image = url;
    }

    const newMessage = await Message.create({ senderId, receiverId, text, image, video });

    // deliver in real time to every open tab/device of the receiver
    for (const socketId of getReceiverSocketIds(receiverId)) {
      io.to(socketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
