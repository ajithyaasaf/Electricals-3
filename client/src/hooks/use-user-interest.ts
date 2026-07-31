import { useState, useEffect } from "react";

export interface UserInterest {
  topCategory: string | null;
  recentCategories: string[];
  hasHistory: boolean;
}

export function useUserInterest(): UserInterest {
  const [interest, setInterest] = useState<UserInterest>({
    topCategory: null,
    recentCategories: [],
    hasHistory: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("copperbear_recently_viewed");
      if (!stored) return;

      const items: Array<{ category?: string; viewedAt?: number }> = JSON.parse(stored);
      if (!Array.isArray(items) || items.length === 0) return;

      // Extract categories from viewed items
      const categories: string[] = [];
      const categoryCount: Record<string, number> = {};

      for (const item of items) {
        if (item.category) {
          const cat = item.category.toLowerCase().trim();
          categories.push(cat);
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        }
      }

      if (categories.length === 0) return;

      // Find top category by frequency
      let topCat: string | null = null;
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCount)) {
        if (count > maxCount) {
          maxCount = count;
          topCat = cat;
        }
      }

      // Unique recent categories
      const uniqueRecent = Array.from(new Set(categories));

      setInterest({
        topCategory: topCat,
        recentCategories: uniqueRecent,
        hasHistory: true,
      });
    } catch (err) {
      console.error("Error parsing user interest from localStorage:", err);
    }
  }, []);

  return interest;
}
