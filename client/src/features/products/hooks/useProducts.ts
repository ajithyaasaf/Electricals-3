// Products feature hooks
import { useQuery } from "@tanstack/react-query";
import type { ProductsResponse, CategoryItem } from "../types";

export const useProducts = (queryParams: any) => {
  return useQuery<ProductsResponse>({
    queryKey: ["/api/products", queryParams],
  });
};

export const useCategories = () => {
  return useQuery<CategoryItem[]>({
    queryKey: ["/api/categories"],
  });
};