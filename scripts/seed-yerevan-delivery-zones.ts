/**
 * One-off: seed Yerevan district delivery zones (hy/en/ru) with fixed AMD fees.
 * Run: pnpm exec tsx scripts/seed-yerevan-delivery-zones.ts
 */
import path from "node:path";

import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { v7 as uuidv7 } from "uuid";

import * as schema from "../src/db/schema";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}
const resolvedDatabaseUrl: string = databaseUrl;

type ZoneSeed = {
  hy: string;
  en: string;
  ru: string;
  priceAmount: number;
  priority: number;
};

const YEREVAN = {
  hy: "Երևան",
  en: "Yerevan",
  ru: "Ереван",
} as const;

/** Districts listed by the product owner — area is always Yerevan. */
const ZONES: ZoneSeed[] = [
  { hy: "Կենտրոն", en: "Kentron", ru: "Центр", priceAmount: 500, priority: 110 },
  {
    hy: "Աջափնյակ",
    en: "Ajapnyak",
    ru: "Аджапняк",
    priceAmount: 500,
    priority: 109,
  },
  {
    hy: "Արաբկիր",
    en: "Arabkir",
    ru: "Арабкир",
    priceAmount: 1000,
    priority: 108,
  },
  { hy: "Ավան", en: "Avan", ru: "Аван", priceAmount: 1000, priority: 107 },
  {
    hy: "Դավթաշեն",
    en: "Davtashen",
    ru: "Давташен",
    priceAmount: 1000,
    priority: 106,
  },
  {
    hy: "Էրեբունի",
    en: "Erebuni",
    ru: "Эребуни",
    priceAmount: 1000,
    priority: 105,
  },
  {
    hy: "Քանաքեռ-Զեյթուն",
    en: "Kanaker-Zeytun",
    ru: "Канакер-Зейтун",
    priceAmount: 1000,
    priority: 104,
  },
  {
    hy: "Մալաթիա-Սեբաստիա",
    en: "Malatia-Sebastia",
    ru: "Малатия-Себастия",
    priceAmount: 1000,
    priority: 103,
  },
  {
    hy: "Նոր Նորք",
    en: "Nor Nork",
    ru: "Нор Норк",
    priceAmount: 1000,
    priority: 102,
  },
  {
    hy: "Նորք-Մարաշ",
    en: "Nork-Marash",
    ru: "Норк-Мараш",
    priceAmount: 1000,
    priority: 101,
  },
  {
    hy: "Շենգավիթ",
    en: "Shengavit",
    ru: "Шенгавит",
    priceAmount: 1000,
    priority: 100,
  },
];

async function main(): Promise<void> {
  const db = drizzle(neon(resolvedDatabaseUrl), { schema });
  const now = new Date();

  await db
    .update(schema.deliveryRules)
    .set({ isActive: false, updatedAt: now })
    .where(eq(schema.deliveryRules.isActive, true));

  for (const zone of ZONES) {
    await db.insert(schema.deliveryRules).values({
      id: uuidv7(),
      countryCode: "AM",
      city: YEREVAN.hy,
      region: zone.hy,
      translations: {
        hy: { area: YEREVAN.hy, district: zone.hy },
        en: { area: YEREVAN.en, district: zone.en },
        ru: { area: YEREVAN.ru, district: zone.ru },
      },
      priceAmount: zone.priceAmount,
      freeThresholdAmount: null,
      isActive: true,
      priority: zone.priority,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Ensure delivery offering is on so checkout can use the zones.
  const [existing] = await db
    .select({ key: schema.storeSettings.key, value: schema.storeSettings.value })
    .from(schema.storeSettings)
    .where(eq(schema.storeSettings.key, "store.delivery"))
    .limit(1);

  if (existing) {
    const previous =
      existing.value && typeof existing.value === "object"
        ? (existing.value as Record<string, unknown>)
        : {};
    await db
      .update(schema.storeSettings)
      .set({
        value: { ...previous, isActive: true },
        updatedAt: now,
      })
      .where(eq(schema.storeSettings.key, "store.delivery"));
  }

  console.log(`Seeded ${ZONES.length} Yerevan delivery zones.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
