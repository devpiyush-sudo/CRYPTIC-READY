import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import { syncUserFromClerkId } from "../lib/clerkUser.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId: userId });

    // Webhook not delivered yet? Pull the profile straight from Clerk so login never blocks on it.
    if (!user) user = await syncUserFromClerkId(userId);

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
