import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlbionItemType, ItemCategoryType } from "@shared/schema";
import SearchFilters from "@/components/search-filters";
import StatsBar from "@/components/stats-bar";
import ItemCard from "@/components/item-card";
import ItemModal from "@/components/item-modal";
import { Button } from "@/components/ui/button";
import { Hammer, Database, RefreshCw } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategoryType | "all">("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [enchantmentFilter, setEnchantmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("profit-desc");
  const [selectedItem, setSelectedItem] = useState<AlbionItemType | null>(null);
  const [visibleItems, setVisibleItems] = useState(20);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery<AlbionItemType[]>({
    queryKey: ["/api/items"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Auto-refresh prices every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      await refetch();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesTier = tierFilter === "all" || item.tier.toString() === tierFilter;
      const matchesEnchantment = enchantmentFilter === "all" || item.enchantment.toString() === enchantmentFilter;
      return matchesSearch && matchesCategory && matchesTier && matchesEnchantment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tier":
          return a.tier - b.tier;
        case "profit-desc":
        case "profit-asc":
        default:
          return a.name.localeCompare(b.name); // Fallback to name sorting
      }
    });

  const displayedItems = filteredItems.slice(0, visibleItems);
  const hasMore = visibleItems < filteredItems.length;

  const loadMore = () => {
    setVisibleItems(prev => prev + 20);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Albion Online items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Database className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-gray-400 mb-4">
            Unable to fetch item data from the Albion Online servers. This could be due to:
          </p>
          <ul className="text-left text-gray-400 text-sm mb-6 space-y-1">
            <li>• Network connectivity issues</li>
            <li>• Albion Online API maintenance</li>
            <li>• Temporary server overload</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Hammer className="text-secondary text-2xl" />
              <h1 className="text-xl font-bold">Albion Craft Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <Database className="text-primary" />
                <span>Live Market Data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 px-2 hover:bg-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        tierFilter={tierFilter}
        setTierFilter={setTierFilter}
        enchantmentFilter={enchantmentFilter}
        setEnchantmentFilter={setEnchantmentFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Bar */}
        <StatsBar 
          totalItems={filteredItems.length}
          allItems={items.length}
        />

        {/* Items Grid - Optimized for iPad Mini 6 and mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          {displayedItems.map(item => (
            <ItemCard
              key={`${item.id}-${item.tier}-${item.enchantment}`}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button 
              onClick={loadMore}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3"
            >
              Load More Items
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Database className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your search filters</p>
          </div>
        )}
      </main>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
