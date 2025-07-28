import { CraftingMaterialType, MarketPriceType } from "@shared/schema";

interface CalculationParams {
  materials: CraftingMaterialType[];
  prices: MarketPriceType[];
  currentItemId: string;
  craftQuantity: number;
  usageFee: number;
  returnRate: number;
  hasPremium: boolean;
}

interface CalculationResult {
  rawMaterialCost: number;
  returnDiscount: number;
  adjustedMaterialCost: number;
  totalUsageFee: number;
  totalCraftingCost: number;
  marketPrice: number;
  expectedSellPrice: number;
  grossRevenue: number;
  marketTax: number;
  netProfit: number;
  profitMargin: number;
}

export function calculateProfit({
  materials,
  prices,
  currentItemId,
  craftQuantity,
  usageFee,
  returnRate,
  hasPremium
}: CalculationParams): CalculationResult {
  // Calculate raw material cost
  const rawMaterialCost = materials.reduce((total, material) => {
    const price = prices.find(p => p.itemId === material.itemId);
    const unitPrice = price?.price || 0;
    return total + (unitPrice * material.quantity * craftQuantity);
  }, 0);

  // Apply return rate discount
  const returnDiscount = rawMaterialCost * (returnRate / 100);
  const adjustedMaterialCost = rawMaterialCost - returnDiscount;

  // Calculate total usage fee
  const totalUsageFee = usageFee * craftQuantity;

  // Calculate total crafting cost
  const totalCraftingCost = adjustedMaterialCost + totalUsageFee;

  // Get market price for the item
  const itemPrice = prices.find(p => p.itemId === currentItemId);
  const marketPrice = itemPrice?.price || 0;

  // Calculate expected sell price (market price - 1000 silver)
  const expectedSellPrice = Math.max(0, marketPrice - 1000);

  // Calculate gross revenue
  const grossRevenue = expectedSellPrice * craftQuantity;

  // Calculate market tax
  const marketTaxRate = hasPremium ? 0.04 : 0.08;
  const marketTax = grossRevenue * marketTaxRate;

  // Calculate net profit
  const netProfit = grossRevenue - marketTax - totalCraftingCost;

  // Calculate profit margin
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    rawMaterialCost,
    returnDiscount,
    adjustedMaterialCost,
    totalUsageFee,
    totalCraftingCost,
    marketPrice,
    expectedSellPrice,
    grossRevenue,
    marketTax,
    netProfit,
    profitMargin
  };
}
