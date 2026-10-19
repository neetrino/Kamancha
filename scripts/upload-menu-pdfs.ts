import { readdir, readFile } from "node:fs/promises";
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
  const bucket = requireEnv("R2_BUCKET_NAME");
  const menusDir = path.join(process.cwd(), "public/assets/menus");
  const files = (await readdir(menusDir)).filter((name) =>
    name.toLowerCase().endsWith(".pdf"),
  );

  for (const name of files) {
    const localPath = path.join(menusDir, name);
    const body = await readFile(localPath);
    const key = `assets/menus/${name}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "application/pdf",
        ContentDisposition: "inline",
      }),
    );
    console.log("uploaded", key, body.length);
  }
}

void main();
