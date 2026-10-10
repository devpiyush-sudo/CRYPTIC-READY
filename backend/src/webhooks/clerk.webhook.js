import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import User from "../models/user.model.js";
import { upsertUserFromClerk } from "../lib/clerkUser.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      return res.status(503).json({ message: "Webhook secret is not configured" });
    }

    // Clerk's verifier wants a Web Request with the untouched raw body (express.raw gives a Buffer).
    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
    const request = new Request("http://internal/api/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    // throws when the signature is wrong or the body was tampered with
    const evt = await verifyWebhook(request, { signingSecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      await upsertUserFromClerk(evt.data);
    }

    if (evt.type === "user.deleted" && evt.data.id) {
      await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in Clerk webhook:", error.message);
    res.status(400).json({ message: "Webhook verification failed" });
  }
});

export default router;
