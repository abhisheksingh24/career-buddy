"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export type CategoryId =
  | "overview"
  | "skills"
  | "experience"
  | "education"
  | "impact"
  | "ats"
  | "quality";

export interface Category {
  id: CategoryId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  score: number;
  actionItemsCount: number;
}

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategoryId: CategoryId | null;
  onCategorySelect: (categoryId: CategoryId) => void;
}

export function CategoryNavigation({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: CategoryNavigationProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIndicator = (score: number) => {
    if (score >= 80) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (score >= 50) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 50) return "Needs Work";
    return "Critical";
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Analysis Categories</h3>
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategoryId === category.id;
        const isLowScore = category.score < 50;

        return (
          <Card
            key={category.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isActive && "ring-2 ring-blue-500 bg-blue-50",
              isLowScore && !isActive && "border-red-200 bg-red-50/30",
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header: Icon, Name, Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {category.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getStatusIndicator(category.score)}
                    <span className={cn("text-lg font-bold", getScoreColor(category.score))}>
                      {category.score}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn("h-full transition-all", getProgressColor(category.score))}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{getStatusLabel(category.score)}</span>
                    {category.actionItemsCount > 0 && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          category.score < 50
                            ? "border-red-300 text-red-700 bg-red-50"
                            : category.score < 80
                              ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                              : "border-green-300 text-green-700 bg-green-50",
                        )}
                      >
                        {category.actionItemsCount} improvements
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
