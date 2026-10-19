import { readFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(process.cwd(), ".env") });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const endpoint =
    process.env.R2_ENDPOINT?.replace(/\/$/, "") ??
    `https://${accountId}.r2.cloudflarestorage.com`;
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  const localPath = path.join(
    process.cwd(),
    "public/assets/menus/tumanyan-menu.pdf",
  );
  const body = await readFile(localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: "assets/menus/tumanyan-menu.pdf",
      Body: body,
      ContentType: "application/pdf",
    }),
  );
  console.log("uploaded assets/menus/tumanyan-menu.pdf", body.length);
}

void main();
