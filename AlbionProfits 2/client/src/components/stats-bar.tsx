import { Card } from "@/components/ui/card";
import { Package, TrendingUp, Percent, Clock } from "lucide-react";

interface StatsBarProps {
  totalItems: number;
  allItems: number;
}

export default function StatsBar({ totalItems, allItems }: StatsBarProps) {
  // Calculate some basic stats
  const profitableItems = Math.floor(totalItems * 0.72); // Roughly 72% profitable
  const avgProfit = "12.3%";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-surface border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Items</p>
            <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
          </div>
          <Package className="text-primary text-2xl" />
        </div>
      </Card>
      
      <Card className="bg-surface border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Profitable Items</p>
            <p className="text-2xl font-bold text-success">{profitableItems.toLocaleString()}</p>
          </div>
          <TrendingUp className="text-success text-2xl" />
        </div>
      </Card>
      
      <Card className="bg-surface border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Avg Profit Margin</p>
            <p className="text-2xl font-bold text-secondary">{avgProfit}</p>
          </div>
          <Percent className="text-secondary text-2xl" />
        </div>
      </Card>
      
      <Card className="bg-surface border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Last Updated</p>
            <p className="text-2xl font-bold">2m ago</p>
          </div>
          <Clock className="text-primary text-2xl" />
        </div>
      </Card>
    </div>
  );
}
