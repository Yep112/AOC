import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ItemCategoryType } from "@shared/schema";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: ItemCategoryType | "all";
  setCategoryFilter: (category: ItemCategoryType | "all") => void;
  tierFilter: string;
  setTierFilter: (tier: string) => void;
  enchantmentFilter: string;
  setEnchantmentFilter: (enchantment: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  tierFilter,
  setTierFilter,
  enchantmentFilter,
  setEnchantmentFilter,
  sortBy,
  setSortBy,
}: SearchFiltersProps) {
  return (
    <div className="bg-surface border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ItemCategoryType | "all")}>
            <SelectTrigger className="bg-gray-800 border-gray-600 focus:border-primary">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="weapons">Weapons</SelectItem>
              <SelectItem value="armor">Armor</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="consumables">Consumables</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="mounts">Mounts</SelectItem>
            </SelectContent>
          </Select>

          {/* Tier Filter */}
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 focus:border-primary">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
              <SelectItem value="3">Tier 3</SelectItem>
              <SelectItem value="4">Tier 4</SelectItem>
              <SelectItem value="5">Tier 5</SelectItem>
              <SelectItem value="6">Tier 6</SelectItem>
              <SelectItem value="7">Tier 7</SelectItem>
              <SelectItem value="8">Tier 8</SelectItem>
            </SelectContent>
          </Select>

          {/* Enchantment Filter */}
          <Select value={enchantmentFilter} onValueChange={setEnchantmentFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 focus:border-primary">
              <SelectValue placeholder="All Enchantments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enchantments</SelectItem>
              <SelectItem value="0">0 (Normal)</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-gray-800 border-gray-600 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit-desc">Highest Profit</SelectItem>
              <SelectItem value="profit-asc">Lowest Profit</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="tier">Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
