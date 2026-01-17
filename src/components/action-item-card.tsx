"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionItem } from "@/lib/types/analysis";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface ActionItemCardProps {
  actionItem: ActionItem;
  className?: string;
}

export function ActionItemCard({ actionItem, className }: ActionItemCardProps) {
  const getPriorityConfig = (priority: ActionItem["priority"]) => {
    switch (priority) {
      case "high":
        return {
          badge: "destructive" as const,
          icon: AlertCircle,
          label: "High Priority",
          iconColor: "text-red-600",
        };
      case "medium":
        return {
          badge: "outline" as const,
          icon: Info,
          label: "Medium Priority",
          iconColor: "text-yellow-600",
        };
      case "low":
        return {
          badge: "secondary" as const,
          icon: CheckCircle2,
          label: "Low Priority",
          iconColor: "text-blue-600",
        };
    }
  };

  const priorityConfig = getPriorityConfig(actionItem.priority);
  const PriorityIcon = priorityConfig.icon;

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Priority Badge and Impact */}
          <div className="flex items-start justify-between gap-2">
            <Badge variant={priorityConfig.badge} className="flex items-center gap-1">
              <PriorityIcon className={cn("h-3 w-3", priorityConfig.iconColor)} />
              {priorityConfig.label}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
              <span>+{actionItem.estimatedImpact}%</span>
              <span className="text-xs text-gray-500 font-normal">impact</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-semibold text-gray-900 leading-tight">
            {actionItem.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{actionItem.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
