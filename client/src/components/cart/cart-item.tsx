import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItemWithProduct } from "@/lib/types";

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      if (newQuantity <= 0) {
        await apiRequest("DELETE", `/api/cart/${item.id}`);
      } else {
        await apiRequest("PUT", `/api/cart/${item.id}`, { quantity: newQuantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      if (quantity <= 0) {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
      setQuantity(item.quantity); // Reset to original quantity
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    if (newQuantity > (item.product.stock || 0)) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.product.stock} items available.`,
        variant: "destructive",
      });
      return;
    }
    
    setQuantity(newQuantity);
    updateQuantityMutation.mutate(newQuantity);
  };

  const handleRemove = () => {
    removeItemMutation.mutate();
  };

  const imageUrl = item.product.imageUrls?.[0] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200";
  const price = parseFloat(item.product.price);
  const totalPrice = price * quantity;

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
        <img
          src={imageUrl}
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.id}`}
          className="text-lg font-medium text-gray-900 hover:text-copper-600 transition-colors"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          ${price.toFixed(2)} each
        </p>
        
        {item.product.stock && item.product.stock < 10 && (
          <p className="text-sm text-orange-600 mt-1">
            Only {item.product.stock} left in stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={updateQuantityMutation.isPending || quantity <= 1}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value) || 0;
            handleQuantityChange(newQuantity);
          }}
          className="w-16 h-8 text-center"
          min="1"
          max={item.product.stock || 999}
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={updateQuantityMutation.isPending || quantity >= (item.product.stock || 0)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          ${totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={removeItemMutation.isPending}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
