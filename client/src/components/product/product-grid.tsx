import { ProductCard } from "./product-card";
import type { ProductWithCategory } from "@/lib/types";
import type { ProductItem } from "@/features/products/types";

interface ProductGridProps {
  products: ProductWithCategory[];
  showCategory?: boolean;
}

export function ProductGrid({ products, showCategory = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}
