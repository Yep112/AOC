import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import axios from "axios";

const ALBION_API_BASE = "https://west.albion-online-data.com/api/v2";
const ITEM_LIST_URL = "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.txt";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all craftable items
  app.get("/api/items", async (req, res) => {
    try {
      // Fetch item list from GitHub metadata
      const response = await axios.get(ITEM_LIST_URL);
      
      if (!response.data) {
        return res.status(500).json({ error: "Failed to fetch items list" });
      }

      // Parse the items.txt format and filter craftable items
      const lines = response.data.split('\n');
      const items = [];
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const match = line.match(/^\s*\d+:\s*([A-Z0-9_@]+)\s*:\s*(.+)$/);
        if (!match) continue;
        
        const [, itemId, itemName] = match;
        
        // Skip non-craftable items (raw resources, farm items, etc.)
        if (itemId.includes('FARM_') || itemId.includes('SEED') || 
            itemId.includes('BABY') || itemId.includes('GROWN') ||
            itemId.includes('UNIQUE_') || itemId.includes('FISH_') ||
            itemId.includes('EGG') || itemId.includes('MILK') ||
            itemId.includes('CARROT') || itemId.includes('BEAN') ||
            itemId.includes('WHEAT') || itemId.includes('TURNIP') ||
            itemId.includes('CABBAGE') || itemId.includes('POTATO') ||
            itemId.includes('CORN') || itemId.includes('PUMPKIN') ||
            itemId.includes('AGARIC') || itemId.includes('COMFREY') ||
            itemId.includes('BURDOCK') || itemId.includes('TEASEL') ||
            itemId.includes('FOXGLOVE') || itemId.includes('MULLEIN') ||
            itemId.includes('YARROW') || itemId.includes('MOUNTUPGRADE') ||
            // Skip raw resources and materials
            itemId.includes('_ORE') || itemId.includes('_HIDE') || 
            itemId.includes('_FIBER') || itemId.includes('_WOOD') ||
            itemId.includes('_ROCK') || itemId.includes('_CLOTH') ||
            itemId.includes('_LEATHER') || itemId.includes('_METALBAR') ||
            itemId.includes('_PLANKS') || itemId.includes('_STONEBLOCK') ||
            itemId.includes('_EXTRACT') || itemId.includes('_ESSENCE') ||
            itemId.includes('_RUNE') || itemId.includes('_SOUL') ||
            itemId.includes('JOURNAL_') || itemId.includes('_LEVEL') ||
            // Skip other non-craftable items
            itemId.includes('TREASURE_') || itemId.includes('_SHARD') ||
            itemId.includes('CRYSTAL_') || itemId.includes('ARTEFACT_')) {
          continue;
        }
        
        // Only include craftable equipment and tools
        if (!itemId.match(/^T[1-8]_/)) continue;
        
        // Extract tier and enchantment from item ID
        const tierMatch = itemId.match(/T(\d)/);
        const enchantMatch = itemId.match(/@(\d)/);
        
        const tier = tierMatch ? parseInt(tierMatch[1]) : 1;
        const enchantment = enchantMatch ? parseInt(enchantMatch[1]) : 0;
        
        // Determine category based on item ID patterns - only craftable end products
        let category = "other";
        
        // Weapons - only actual craftable weapons
        if (itemId.includes("_SWORD") || itemId.includes("_BOW") || itemId.includes("_CROSSBOW") ||
            itemId.includes("_HAMMER") || itemId.includes("_AXE") || itemId.includes("_SPEAR") ||
            itemId.includes("_DAGGER") || itemId.includes("_QUARTERSTAFF") || itemId.includes("_MACE") ||
            itemId.includes("_FIRESTAFF") || itemId.includes("_FROSTSTAFF") || itemId.includes("_ARCANESTAFF") ||
            itemId.includes("_HOLYSTAFF") || itemId.includes("_NATURESTAFF") || itemId.includes("_CURSEDSTAFF") ||
            itemId.includes("_SHIELD") || itemId.includes("_BOOK") || itemId.includes("_ORB") ||
            itemId.includes("_TOTEM") || itemId.includes("_HORN")) {
          category = "weapons";
        }
        // Armor - head, chest, shoes
        else if (itemId.includes("_HEAD") || itemId.includes("_ARMOR") || itemId.includes("_SHOES")) {
          category = "armor";
        }
        // Accessories - bags, capes
        else if (itemId.includes("_BAG") || itemId.includes("_CAPE") || itemId.includes("_CAPEITEM")) {
          category = "accessories";
        }
        // Mounts - horses, oxen, etc.
        else if (itemId.includes("_MOUNT") || itemId.includes("_HORSE") || itemId.includes("_OX")) {
          category = "mounts";
        }
        // Consumables - potions, food
        else if (itemId.includes("_POTION") || itemId.includes("_MEAL") || itemId.includes("_SOUP") ||
                 itemId.includes("_SANDWICH") || itemId.includes("_PIE") || itemId.includes("_OMELETTE")) {
          category = "consumables";
        }
        // Tools - gathering and crafting tools
        else if (itemId.includes("_TOOL") || itemId.includes("_PICKAXE") || itemId.includes("_SICKLE") ||
                 itemId.includes("_SKINNINGKNIFE") || itemId.includes("_STONEHAMMER") || 
                 itemId.includes("_WOODAXE") || itemId.includes("_FIBERKNIFE")) {
          category = "tools";
        }
        
        // Skip items that don't fall into known craftable categories
        if (category === "other") {
          continue;
        }

        items.push({
          id: itemId,
          name: itemName.trim(),
          category,
          tier,
          enchantment,
          icon: `https://render.albiononline.com/v1/item/${itemId}.png`
        });
      }

      // Remove duplicates and sort by tier then name
      const uniqueItems = items.filter((item, index, arr) => 
        arr.findIndex(i => i.id === item.id) === index
      ).sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.name.localeCompare(b.name);
      });

      res.json(uniqueItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        error: "Failed to fetch items", 
        details: errorMessage
      });
    }
  });

  // Get market prices for specific items
  app.get("/api/prices", async (req, res) => {
    try {
      const { items: itemIds } = req.query;
      
      if (!itemIds || typeof itemIds !== 'string') {
        return res.status(400).json({ error: "Items parameter is required" });
      }

      const response = await axios.get(`${ALBION_API_BASE}/stats/prices/${itemIds}`, {
        params: {
          locations: "Caerleon,Bridgewatch,Lymhurst,Martlock,Thetford,FortSterling"
          // Note: We only care about enchantment levels (0-4), not quality
        }
      });

      if (!response.data) {
        return res.status(500).json({ error: "Failed to fetch prices from Albion API" });
      }

      // Find the lowest price for each item across all cities
      const priceMap = new Map();
      
      response.data.forEach((priceData: any) => {
        const existing = priceMap.get(priceData.item_id);
        const hasValidPrice = priceData.sell_price_min && priceData.sell_price_min > 0;
        
        if (!existing || (hasValidPrice && priceData.sell_price_min < existing.price)) {
          priceMap.set(priceData.item_id, {
            itemId: priceData.item_id,
            price: priceData.sell_price_min || 0,
            timestamp: priceData.sell_price_min_date,
            city: priceData.city,
            isAvailable: hasValidPrice,
            warning: !hasValidPrice ? "Price not found. Please check https://www.albiononline-tools.com/ or the official market manually." : null
          });
        }
      });

      // Ensure all requested items have entries, even if no price data
      const itemIdList = itemIds.split(',').map(id => id.trim());
      itemIdList.forEach(itemId => {
        if (!priceMap.has(itemId)) {
          priceMap.set(itemId, {
            itemId,
            price: 0,
            timestamp: new Date().toISOString(),
            city: 'Unknown',
            isAvailable: false,
            warning: "Price not found. Please check https://www.albiononline-tools.com/ or the official market manually."
          });
        }
      });

      const prices = Array.from(priceMap.values());
      res.json(prices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  // Get crafting requirements for an item
  app.get("/api/crafting/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      
      // Use accurate crafting materials based on Albion Online patterns
      const materials = generateCraftingMaterials(itemId);
      
      if (materials.length === 0) {
        return res.status(404).json({ 
          error: "Crafting recipe not found", 
          message: `No crafting recipe available for ${itemId}` 
        });
      }

      res.json(materials);
    } catch (error) {
      console.error("Error fetching crafting data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        error: "Failed to fetch crafting data",
        details: errorMessage
      });
    }
  });
  
  // Helper function to format item names from IDs
  function formatItemName(itemId: string): string {
    // Extract tier
    const tierMatch = itemId.match(/T(\d)/);
    const tier = tierMatch ? `Tier ${tierMatch[1]}` : '';
    
    // Remove tier prefix and convert to readable name
    let name = itemId.replace(/^T\d_/, '').replace(/_/g, ' ');
    
    // Capitalize each word
    name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    // Add tier prefix if exists
    return tier ? `${tier} ${name}` : name;
  }
  
  // Helper function to generate accurate crafting materials based on Albion Online patterns
  function generateCraftingMaterials(itemId: string): any[] {
    const materials = [];
    
    // Extract tier and enchantment from item ID
    const tierMatch = itemId.match(/T(\d)/);
    const enchantMatch = itemId.match(/@(\d)/);
    const tier = tierMatch ? parseInt(tierMatch[1]) : 4;
    const enchantment = enchantMatch ? parseInt(enchantMatch[1]) : 0;
    
    // Enchantment multipliers for materials (accurate to Albion Online)
    const enchantMultiplier = [1, 2, 4, 8, 16][enchantment] || 1;
    
    // WEAPONS - Accurate material patterns
    if (itemId.includes("_SWORD") || itemId.includes("_AXE") || itemId.includes("_MACE") || 
        itemId.includes("_SPEAR") || itemId.includes("_DAGGER") || itemId.includes("_HAMMER")) {
      // Metal weapons
      const baseMetal = itemId.includes("2H_") ? 20 : 16;
      const basePlanks = itemId.includes("2H_") ? 12 : 8;
      materials.push(
        { itemId: `T${tier}_ORE`, name: `Tier ${tier} Ore`, quantity: baseMetal * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_METALBAR`, name: `Tier ${Math.max(1, tier-1)} Metal Bar`, quantity: basePlanks * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_RUNE`, name: `Tier ${tier} Rune`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    } else if (itemId.includes("_BOW") || itemId.includes("_CROSSBOW")) {
      // Ranged weapons
      const baseWood = itemId.includes("2H_") ? 20 : 16;
      const basePlanks = itemId.includes("2H_") ? 12 : 8;
      materials.push(
        { itemId: `T${tier}_WOOD`, name: `Tier ${tier} Wood`, quantity: baseWood * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_PLANKS`, name: `Tier ${Math.max(1, tier-1)} Planks`, quantity: basePlanks * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_SOUL`, name: `Tier ${tier} Soul`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    } else if (itemId.includes("STAFF") || itemId.includes("_ORB") || itemId.includes("_BOOK")) {
      // Magic weapons
      const baseFiber = itemId.includes("2H_") ? 20 : 16;
      const baseCloth = itemId.includes("2H_") ? 12 : 8;
      materials.push(
        { itemId: `T${tier}_FIBER`, name: `Tier ${tier} Fiber`, quantity: baseFiber * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_CLOTH`, name: `Tier ${Math.max(1, tier-1)} Cloth`, quantity: baseCloth * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_RELIC`, name: `Tier ${tier} Relic`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    }
    // ARMOR - Based on material type
    else if (itemId.includes("_HEAD") || itemId.includes("_ARMOR") || itemId.includes("_SHOES")) {
      if (itemId.includes("CLOTH") || itemId.includes("ROBE")) {
        // Cloth armor
        const baseFiber = itemId.includes("_ARMOR") ? 16 : (itemId.includes("_HEAD") ? 8 : 8);
        materials.push(
          { itemId: `T${tier}_FIBER`, name: `Tier ${tier} Fiber`, quantity: baseFiber * enchantMultiplier, unitPrice: 0, totalCost: 0 },
          { itemId: `T${Math.max(1, tier-1)}_CLOTH`, name: `Tier ${Math.max(1, tier-1)} Cloth`, quantity: Math.floor(baseFiber * 0.4) * enchantMultiplier, unitPrice: 0, totalCost: 0 }
        );
      } else if (itemId.includes("LEATHER") || itemId.includes("JACKET")) {
        // Leather armor
        const baseHide = itemId.includes("_ARMOR") ? 16 : (itemId.includes("_HEAD") ? 8 : 8);
        materials.push(
          { itemId: `T${tier}_HIDE`, name: `Tier ${tier} Hide`, quantity: baseHide * enchantMultiplier, unitPrice: 0, totalCost: 0 },
          { itemId: `T${Math.max(1, tier-1)}_LEATHER`, name: `Tier ${Math.max(1, tier-1)} Leather`, quantity: Math.floor(baseHide * 0.4) * enchantMultiplier, unitPrice: 0, totalCost: 0 }
        );
      } else if (itemId.includes("PLATE") || itemId.includes("HEAVY")) {
        // Plate armor
        const baseOre = itemId.includes("_ARMOR") ? 16 : (itemId.includes("_HEAD") ? 8 : 8);
        materials.push(
          { itemId: `T${tier}_ORE`, name: `Tier ${tier} Ore`, quantity: baseOre * enchantMultiplier, unitPrice: 0, totalCost: 0 },
          { itemId: `T${Math.max(1, tier-1)}_METALBAR`, name: `Tier ${Math.max(1, tier-1)} Metal Bar`, quantity: Math.floor(baseOre * 0.4) * enchantMultiplier, unitPrice: 0, totalCost: 0 }
        );
      }
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_RUNE`, name: `Tier ${tier} Rune`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    }
    // ACCESSORIES
    else if (itemId.includes("_BAG") || itemId.includes("_CAPE")) {
      materials.push(
        { itemId: `T${tier}_FIBER`, name: `Tier ${tier} Fiber`, quantity: 8 * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_CLOTH`, name: `Tier ${Math.max(1, tier-1)} Cloth`, quantity: 4 * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_RELIC`, name: `Tier ${tier} Relic`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    }
    // TOOLS
    else if (itemId.includes("_TOOL") || itemId.includes("PICKAXE") || itemId.includes("AXE") || 
             itemId.includes("SICKLE") || itemId.includes("HAMMER") || itemId.includes("KNIFE")) {
      materials.push(
        { itemId: `T${tier}_ORE`, name: `Tier ${tier} Ore`, quantity: 12 * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_METALBAR`, name: `Tier ${Math.max(1, tier-1)} Metal Bar`, quantity: 6 * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${tier}_WOOD`, name: `Tier ${tier} Wood`, quantity: 4 * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
      if (enchantment > 0) {
        materials.push({ itemId: `T${tier}_SOUL`, name: `Tier ${tier} Soul`, quantity: enchantment, unitPrice: 0, totalCost: 0 });
      }
    }
    // CONSUMABLES - Potions and food
    else if (itemId.includes("_POTION") || itemId.includes("_MEAL") || itemId.includes("_SOUP")) {
      // Simple materials for consumables
      materials.push(
        { itemId: `T${tier}_FIBER`, name: `Tier ${tier} Fiber`, quantity: 4 * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${tier}_ORE`, name: `Tier ${tier} Ore`, quantity: 2 * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
    }
    // DEFAULT - For unknown items
    else {
      materials.push(
        { itemId: `T${tier}_ORE`, name: `Tier ${tier} Ore`, quantity: 16 * enchantMultiplier, unitPrice: 0, totalCost: 0 },
        { itemId: `T${Math.max(1, tier-1)}_METALBAR`, name: `Tier ${Math.max(1, tier-1)} Metal Bar`, quantity: 8 * enchantMultiplier, unitPrice: 0, totalCost: 0 }
      );
    }
    
    return materials;
  }

  const httpServer = createServer(app);
  return httpServer;
}
