import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Albion Online item types
export const ItemCategory = z.enum([
  "weapons",
  "armor", 
  "accessories",
  "consumables",
  "tools",
  "mounts"
]);

export const AlbionItem = z.object({
  id: z.string(),
  name: z.string(),
  category: ItemCategory,
  tier: z.number().min(1).max(8),
  enchantment: z.number().min(0).max(4),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const MarketPrice = z.object({
  itemId: z.string(),
  price: z.number(),
  timestamp: z.string(),
  city: z.string().optional(),
  isAvailable: z.boolean().optional(),
  warning: z.string().nullable().optional(),
});

export const CraftingMaterial = z.object({
  itemId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalCost: z.number(),
});

export const ProfitCalculation = z.object({
  itemId: z.string(),
  tier: z.number(),
  enchantment: z.number(),
  quantity: z.number(),
  rawMaterialCost: z.number(),
  adjustedMaterialCost: z.number(),
  usageFee: z.number(),
  totalCraftingCost: z.number(),
  marketPrice: z.number(),
  expectedSellPrice: z.number(),
  grossRevenue: z.number(),
  marketTax: z.number(),
  netProfit: z.number(),
  profitMargin: z.number(),
  returnRate: z.number(),
  hasPremium: z.boolean(),
});

export type ItemCategoryType = z.infer<typeof ItemCategory>;
export type AlbionItemType = z.infer<typeof AlbionItem>;
export type MarketPriceType = z.infer<typeof MarketPrice>;
export type CraftingMaterialType = z.infer<typeof CraftingMaterial>;
export type ProfitCalculationType = z.infer<typeof ProfitCalculation>;
