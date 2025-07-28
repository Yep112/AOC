import { AlbionItemType, MarketPriceType, CraftingMaterialType } from "@shared/schema";

const REQUEST_TIMEOUT = 30000; // 30 seconds

function createTimeoutController(timeoutMs = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
}

export async function fetchItems(): Promise<AlbionItemType[]> {
  const { controller, timeout } = createTimeoutController();
  
  try {
    const response = await fetch("/api/items", {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch items'}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array of items');
    }
    
    clearTimeout(timeout);
    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
}

export async function fetchPrices(itemIds: string[]): Promise<MarketPriceType[]> {
  if (!itemIds.length) {
    return [];
  }
  
  const { controller, timeout } = createTimeoutController();
  const items = itemIds.join(",");
  
  try {
    const response = await fetch(`/api/prices?items=${encodeURIComponent(items)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch prices'}`);
    }
    
    const data = await response.json();
    clearTimeout(timeout);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Price request timed out. Market data may be temporarily unavailable.');
    }
    throw error;
  }
}

export async function fetchCraftingMaterials(itemId: string): Promise<CraftingMaterialType[]> {
  if (!itemId) {
    throw new Error('Item ID is required');
  }
  
  const { controller, timeout } = createTimeoutController();
  
  try {
    const response = await fetch(`/api/crafting/${encodeURIComponent(itemId)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch crafting materials'}`);
    }
    
    const data = await response.json();
    clearTimeout(timeout);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Crafting data request timed out. Please try again.');
    }
    throw error;
  }
}
