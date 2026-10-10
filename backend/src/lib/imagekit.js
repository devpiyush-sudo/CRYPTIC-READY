import ImageKit, { toFile } from "@imagekit/nodejs";

export function hasImageKitConfig() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

// created lazily so the server still boots when ImageKit is not configured
let client;
function getClient() {
  client ??= new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });
  return client;
}

// "My Photo (1).png" -> "chat-1749300000000-My_Photo__1_.png"
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

export async function uploadChatMedia(file) {
  const fileName = createFileName(file.originalname);

  const result = await getClient().files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/chat",
  });

  return result.url;
}
