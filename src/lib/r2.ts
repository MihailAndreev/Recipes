import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 5 * 1024 * 1024;

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET_NAME;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw new Error("R2 configuration is incomplete.");
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrl: publicUrl.replace(/\/$/, ""),
  };
}

function getR2Client() {
  const config = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function getExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  return file.type.split("/")[1] ?? "jpg";
}

export async function uploadRecipePhoto(recipeId: number, file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const config = getR2Config();
  const key = `recipes/${recipeId}/${randomUUID()}.${getExtension(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return {
    key,
    url: `${config.publicUrl}/${key}`,
  };
}

export function getRecipePhotoKey(photoUrl: string | null) {
  if (!photoUrl) {
    return null;
  }

  const { publicUrl } = getR2Config();

  if (!photoUrl.startsWith(`${publicUrl}/`)) {
    return null;
  }

  return photoUrl.slice(publicUrl.length + 1);
}

export async function deleteRecipePhoto(photoUrl: string | null) {
  const key = getRecipePhotoKey(photoUrl);

  if (!key) {
    return;
  }

  const config = getR2Config();
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
