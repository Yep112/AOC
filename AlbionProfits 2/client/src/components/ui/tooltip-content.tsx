import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ content, children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children || <Info className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help" />}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-gray-800 border-gray-600 text-gray-100 p-3">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}