import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, TrendingUp, List, Calculator, Clock, Bookmark, Info, X, HelpCircle } from "lucide-react";
import { AlbionItemType, CraftingMaterialType, MarketPriceType } from "@shared/schema";
import { calculateProfit } from "@/lib/profit-calculator";
import { InfoTooltip } from "@/components/ui/tooltip-content";

interface ItemModalProps {
  item: AlbionItemType;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ item, isOpen, onClose }: ItemModalProps) {
  const [selectedTier, setSelectedTier] = useState(item.tier.toString());
  const [selectedEnchantment, setSelectedEnchantment] = useState(item.enchantment.toString());
  const [craftQuantity, setCraftQuantity] = useState(1);
  const [usageFee, setUsageFee] = useState(250);
  const [returnRate, setReturnRate] = useState(15);
  const [hasPremium, setHasPremium] = useState(true);

  // Generate item ID for current configuration
  const currentItemId = `${item.id.split('@')[0]}@${selectedEnchantment}`.replace(/T\d/, `T${selectedTier}`);

  // Fetch crafting materials
  const { data: materials = [] } = useQuery<CraftingMaterialType[]>({
    queryKey: ["/api/crafting", currentItemId],
    enabled: isOpen,
  });

  // Fetch market prices for the item and materials
  const allItemIds = [currentItemId, ...materials.map(m => m.itemId)].join(",");
  const { data: prices = [] } = useQuery<MarketPriceType[]>({
    queryKey: ["/api/prices", { items: allItemIds }],
    enabled: isOpen && materials.length > 0,
  });

  // Calculate profit
  const calculation = calculateProfit({
    materials,
    prices,
    currentItemId,
    craftQuantity,
    usageFee,
    returnRate,
    hasPremium
  });

  // Update materials with prices
  const materialsWithPrices = materials.map(material => {
    const price = prices.find(p => p.itemId === material.itemId);
    const unitPrice = price?.price || 0;
    return {
      ...material,
      unitPrice,
      totalCost: unitPrice * material.quantity
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-surface border-gray-700 w-full mx-4 sm:mx-auto">
        {/* Modal Header */}
        <DialogHeader className="bg-surface-variant border-b border-gray-600 -m-6 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain transition-opacity duration-200"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'none';
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                      fallback.classList.add('w-full', 'h-full', 'items-center', 'justify-center');
                    }
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center bg-gray-600 rounded">
                  <div className="text-primary text-lg sm:text-2xl">⚔️</div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-2xl font-bold text-white truncate">
                  {item.name}
                </DialogTitle>
                <p className="text-gray-400 text-sm">Calculate crafting profitability</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Item Configuration */}
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Settings className="mr-2 text-primary" />
                  Item Configuration
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Tier</Label>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tier 1 (Beginner's)</SelectItem>
                        <SelectItem value="2">Tier 2 (Novice's)</SelectItem>
                        <SelectItem value="3">Tier 3 (Journeyman's)</SelectItem>
                        <SelectItem value="4">Tier 4 (Adept's)</SelectItem>
                        <SelectItem value="5">Tier 5 (Expert's)</SelectItem>
                        <SelectItem value="6">Tier 6 (Master's)</SelectItem>
                        <SelectItem value="7">Tier 7 (Grandmaster's)</SelectItem>
                        <SelectItem value="8">Tier 8 (Elder's)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      Enchantment Level
                      <InfoTooltip content="Enchantment levels (0-4) affect crafting material requirements and item power. Higher enchantments require significantly more materials." />
                    </Label>
                    <Select value={selectedEnchantment} onValueChange={setSelectedEnchantment}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (No Enchantment)</SelectItem>
                        <SelectItem value="1">1 (Enchanted)</SelectItem>
                        <SelectItem value="2">2 (Rare)</SelectItem>
                        <SelectItem value="3">3 (Exceptional)</SelectItem>
                        <SelectItem value="4">4 (Pristine)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-white flex items-center gap-2">
                    Quantity to Craft
                    <InfoTooltip content="The number of items you want to craft. Affects total material costs and profit calculations." />
                  </Label>
                  <Input
                    type="number"
                    value={craftQuantity}
                    onChange={(e) => setCraftQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="999"
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                </div>
              </Card>

              {/* Crafting Settings */}
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Settings className="mr-2 text-secondary" />
                  Crafting Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      Usage Fee per Item (Silver)
                      <InfoTooltip content="The silver cost to use a crafting station per item crafted. Higher tier stations typically cost more but may provide bonuses." />
                    </Label>
                    <Input
                      type="number"
                      value={usageFee}
                      onChange={(e) => setUsageFee(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      max="10000"
                      placeholder="250"
                      className="bg-gray-700 border-gray-600 text-white font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      Return Rate (%)
                      <InfoTooltip content="The chance to recover materials when crafting. Focus levels and quality of materials affect this rate. Typical range: 10-30%." />
                    </Label>
                    <Input
                      type="number"
                      value={returnRate}
                      onChange={(e) => setReturnRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="15.0"
                      className="bg-gray-700 border-gray-600 text-white font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      Premium Status
                      <InfoTooltip content="Premium status reduces market tax from 8% to 4%. Premium can be bought with gold or real money." />
                    </Label>
                    <RadioGroup 
                      value={hasPremium.toString()} 
                      onValueChange={(value) => setHasPremium(value === "true")}
                      className="flex flex-col sm:flex-row gap-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="premium" />
                        <Label htmlFor="premium" className="text-white cursor-pointer">Premium (4% tax)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no-premium" />
                        <Label htmlFor="no-premium" className="text-white cursor-pointer">No Premium (8% tax)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {/* Market Data */}
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <TrendingUp className="mr-2 text-success" />
                  Market Data
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      Current Market Price:
                      <InfoTooltip content="The lowest current sell price across all major cities. This is the competitive market rate." />
                    </span>
                    <span className="font-mono text-lg text-white">
                      {calculation.marketPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      Expected Sell Price:
                      <InfoTooltip content="Your competitive sell price = Market price minus 1,000 silver. This ensures quick sales while maximizing profit." />
                    </span>
                    <span className="font-mono text-lg text-secondary">
                      {calculation.expectedSellPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 border-t border-gray-600 pt-2 flex items-center gap-1">
                    <Info className="h-3 w-3 flex-shrink-0" />
                    <span>Undercuts market by 1,000 silver for competitive pricing</span>
                  </div>
                </div>
              </Card>

              {/* Required Materials */}
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <List className="mr-2 text-warning" />
                  Required Materials
                </h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                  {materialsWithPrices.length > 0 ? (
                    materialsWithPrices.map((material, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-700 last:border-b-0 gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <div className="text-warning text-xs">📦</div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{material.name}</p>
                            <p className="text-xs text-gray-400">x{material.quantity} needed</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0 ml-11 sm:ml-0">
                          <p className="text-sm font-mono text-white">{material.totalCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">@{material.unitPrice.toLocaleString()} each</p>
                          {(() => {
                            const price = prices.find(p => p.itemId === material.itemId);
                            if (price?.warning) {
                              return (
                                <p className="text-xs text-yellow-500 mt-1 max-w-32 break-words">
                                  ⚠️ {price.warning}
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-warning text-2xl mb-2">📦</div>
                      <p className="text-sm">Loading materials...</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Profit Calculation */}
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Calculator className="mr-2 text-success" />
                  Profit Calculation
                </h3>
                
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      Raw Material Cost:
                      <InfoTooltip content="Total cost of all materials needed for crafting, based on current market prices." />
                    </span>
                    <span className="font-mono text-white">{calculation.rawMaterialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      Return Rate Discount ({returnRate}%):
                      <InfoTooltip content="Materials saved due to return rate. Higher crafting focus and quality materials increase this." />
                    </span>
                    <span className="font-mono text-green-400">-{calculation.returnDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400">Adjusted Material Cost:</span>
                    <span className="font-mono text-white">{calculation.adjustedMaterialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      Usage Fee:
                      <InfoTooltip content="Total silver cost for using crafting stations. Fee multiplied by quantity crafted." />
                    </span>
                    <span className="font-mono text-white">{calculation.totalUsageFee.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-gray-600" />
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-medium gap-1">
                    <span className="text-white">Total Crafting Cost:</span>
                    <span className="font-mono text-white font-bold">{calculation.totalCraftingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400">Gross Revenue:</span>
                    <span className="font-mono text-white">{calculation.grossRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      Market Tax ({hasPremium ? "4" : "8"}%):
                      <InfoTooltip content="Auction house fees deducted when you sell items. Premium status reduces this significantly." />
                    </span>
                    <span className="font-mono text-red-400">-{calculation.marketTax.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-gray-600" />
                  <div className="flex flex-col sm:flex-row sm:justify-between text-base lg:text-lg font-bold gap-1">
                    <span className="text-white">Net Profit:</span>
                    <span className={`font-mono ${calculation.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {calculation.netProfit >= 0 ? "+" : ""}{calculation.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-400 flex items-center gap-2">
                      Profit Margin:
                      <InfoTooltip content="Net profit as a percentage of gross revenue. Higher is better for sustainable crafting." />
                    </span>
                    <span className={`font-mono ${calculation.profitMargin >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {calculation.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Profit Summary */}
                  <div className={`mt-4 p-3 rounded-lg border ${
                    calculation.netProfit >= 0 
                      ? "bg-green-900/20 border-green-500/30" 
                      : "bg-red-900/20 border-red-500/30"
                  }`}>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">
                        {calculation.netProfit >= 0 ? "Profitable Craft" : "Loss-Making Craft"}
                      </p>
                      <p className={`text-lg font-bold ${
                        calculation.netProfit >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {calculation.netProfit >= 0 ? "+" : ""}{Math.floor(calculation.netProfit / (craftQuantity || 1)).toLocaleString()} per item
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-variant border-t border-gray-600 -m-6 mt-6 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <Clock className="inline mr-1 h-4 w-4" />
              Market data updated 2 minutes ago
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-500 border-gray-600"
              >
                Close
              </Button>
              <Button className="bg-primary hover:bg-blue-600 text-white">
                <Bookmark className="mr-2 h-4 w-4" />
                Save Calculation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
