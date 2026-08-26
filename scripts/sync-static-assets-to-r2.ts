/**
 * Uploads static assets from `public/assets/` (and app icons) to Cloudflare R2.
 *
 * Usage: pnpm r2:sync-static-assets
 * Requires R2_* env vars in `.env`.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(process.cwd(), ".env") });

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

type UploadTarget = {
  localPath: string;
  objectKey: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

async function collectFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const keyPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, keyPrefix)));
      continue;
    }

    if (entry.isFile()) {
      if (entry.name === ".DS_Store") {
        continue;
      }
      files.push(keyPrefix);
    }
  }

  return files;
}

async function buildUploadTargets(): Promise<UploadTarget[]> {
  const targets: UploadTarget[] = [];
  const assetsRoot = path.join(process.cwd(), "public", "assets");
  const assetFiles = await collectFiles(assetsRoot);

  for (const relative of assetFiles) {
    targets.push({
      localPath: path.join(assetsRoot, relative),
      objectKey: `assets/${relative.replace(/\\/g, "/")}`,
    });
  }

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  try {
    const uploadFiles = await collectFiles(uploadsRoot);
    for (const relative of uploadFiles) {
      targets.push({
        localPath: path.join(uploadsRoot, relative),
        objectKey: `uploads/${relative.replace(/\\/g, "/")}`,
      });
    }
  } catch {
    // No local uploads yet.
  }

  const appIcons: UploadTarget[] = [
    {
      localPath: path.join(process.cwd(), "src", "app", "icon.svg"),
      objectKey: "assets/brand/favicon.svg",
    },
    {
      localPath: path.join(process.cwd(), "src", "app", "apple-icon.png"),
      objectKey: "assets/brand/apple-icon.png",
    },
  ];

  for (const icon of appIcons) {
    try {
      await stat(icon.localPath);
      targets.push(icon);
    } catch {
      // Optional app icons — skip when absent.
    }
  }

  return targets;
}

async function main(): Promise<void> {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucketName = requireEnv("R2_BUCKET_NAME");
  const endpoint =
    process.env.R2_ENDPOINT?.replace(/\/$/, "") ??
    `https://${accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const targets = await buildUploadTargets();
  let uploaded = 0;

  for (const target of targets) {
    const body = await readFile(target.localPath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: target.objectKey,
        Body: body,
        ContentType: contentTypeFor(target.localPath),
      }),
    );
    uploaded += 1;
    console.log(`uploaded ${target.objectKey}`);
  }

  console.log(`Done. Uploaded ${uploaded} file(s) to R2 bucket "${bucketName}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
