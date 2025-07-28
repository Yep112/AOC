import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Gem, Hammer, Pickaxe } from "lucide-react";
import { AlbionItemType } from "@shared/schema";

interface ItemCardProps {
  item: AlbionItemType;
  onClick: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {

  const getItemIcon = (category: string) => {
    switch (category) {
      case "weapons":
        return <Sword className="text-primary" />;
      case "armor":
        return <Shield className="text-primary" />;
      case "accessories":
        return <Gem className="text-secondary" />;
      case "tools":
        return <Pickaxe className="text-warning" />;
      default:
        return <Hammer className="text-primary" />;
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 3: return "bg-green-600 text-white";
      case 4: return "bg-blue-600 text-white";
      case 5: return "bg-red-600 text-white";
      case 6: return "bg-orange-600 text-white";
      case 7: return "bg-yellow-600 text-black";
      case 8: return "bg-white text-black";
      default: return "bg-gray-600 text-gray-300";
    }
  };

  const getEnchantmentColor = (enchantment: number) => {
    switch (enchantment) {
      case 0: return "bg-gray-600 text-gray-300";
      case 1: return "bg-green-600 text-white";
      case 2: return "bg-blue-600 text-white";
      case 3: return "bg-purple-600 text-white";
      case 4: return "bg-yellow-600 text-black";
      default: return "bg-gray-600 text-gray-300";
    }
  };

  return (
    <Card 
      className="bg-surface border-gray-700 hover:border-primary cursor-pointer transition-all duration-200 transform hover:scale-105 p-3 sm:p-4 touch-manipulation"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs px-2 py-1 font-mono ${getTierColor(item.tier)}`}>
            T{item.tier}
          </Badge>
          {item.enchantment > 0 && (
            <Badge className={`text-xs px-2 py-1 font-mono ${getEnchantmentColor(item.enchantment)}`}>
              {item.enchantment}
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-400 capitalize">
          {item.category}
        </div>
      </div>

      {/* Item Icon */}
      <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
        <img 
          src={item.icon} 
          alt={item.name}
          className="w-12 h-12 object-contain transition-opacity duration-200"
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
          <div className="text-center">
            {getItemIcon(item.category)}
            <div className="text-xs text-gray-400 mt-1">No Image</div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium text-center mb-2 line-clamp-2">
        {item.name}
      </h3>

      {/* Action Indicator */}
      <div className="pt-3 border-t border-gray-600 text-center">
        <p className="text-xs text-gray-400 mb-1">Click to analyze</p>
        <div className="text-primary text-sm font-medium">
          Profit Calculator →
        </div>
      </div>
    </Card>
  );
}
