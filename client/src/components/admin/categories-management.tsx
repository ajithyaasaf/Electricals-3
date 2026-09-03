import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Category, Product } from "@shared/types";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Lock,
  Package,
  ExternalLink,
  ImageIcon,
  Search,
} from "lucide-react";
import { Link } from "wouter";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoriesManagementProps {
  products?: Product[];
}

export function CategoriesManagement({ products = [] }: CategoriesManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch categories from API
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json();
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  });

  // Calculate product count per category
  const getProductCountForCategory = (cat: Category) => {
    return products.filter(
      (p) =>
        p.categoryId === cat.id ||
        (p.category && p.category.toLowerCase() === cat.name.toLowerCase())
    ).length;
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
    });
    setDialogOpen(true);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      return apiRequest("POST", "/api/categories", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Category Created",
        description: "New category has been added to your catalog.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create category.",
        variant: "destructive",
      });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (!editingCategory) return;
      return apiRequest("PUT", `/api/categories/${editingCategory.id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDialogOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Category Updated",
        description: "Category details have been saved.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update category.",
        variant: "destructive",
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({
        title: "Category Deleted",
        description: "The empty category has been removed.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Cannot Delete Category",
        description: err.message || "Failed to delete category.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    const cleanedValues: CategoryFormValues = {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      description: values.description?.trim() || undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
    };

    if (!editingCategory) {
      const duplicate = categories.find(
        (c) => c.slug.toLowerCase() === cleanedValues.slug.toLowerCase()
      );
      if (duplicate) {
        form.setError("slug", {
          type: "manual",
          message: "A category with this URL slug already exists.",
        });
        return;
      }
    }

    if (editingCategory) {
      updateMutation.mutate(cleanedValues);
    } else {
      createMutation.mutate(cleanedValues);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val);
    if (!editingCategory) {
      // Auto-generate slug for new categories
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", autoSlug);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Category Catalog
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Manage your store taxonomy. Categories organize products across storefront menus and catalog filters.
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Category
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search bar */}
          <div className="mb-4 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search categories by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Layers className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-700">No categories found</p>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery ? "Try a different search query." : "Click 'Add Category' to create your first category."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-14">Image</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Slug</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700">Products</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => {
                    const productCount = getProductCountForCategory(cat);
                    const isProtected = productCount > 0;

                    return (
                      <TableRow key={cat.id} className="hover:bg-teal-50/20 transition-colors">
                        {/* Thumbnail */}
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            {cat.imageUrl ? (
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>

                        {/* Name & Mobile details */}
                        <TableCell>
                          <div>
                            <span className="font-semibold text-gray-900">{cat.name}</span>
                            <div className="md:hidden text-xs text-gray-500 mt-0.5">
                              Slug: <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">{cat.slug}</code>
                            </div>
                          </div>
                        </TableCell>

                        {/* Slug */}
                        <TableCell className="hidden md:table-cell font-mono text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                            {cat.slug}
                          </span>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="hidden lg:table-cell text-xs text-gray-500 max-w-xs truncate">
                          {cat.description || "—"}
                        </TableCell>

                        {/* Products Count Badge */}
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-semibold px-2 py-0.5 inline-flex items-center gap-1 ${
                              productCount > 0
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            <span>{productCount} Products</span>
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View in Store */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-teal-700"
                              asChild
                              title="View Category on Store"
                            >
                              <Link href={`/products?category=${cat.slug}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>

                            {/* Edit Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-teal-700 hover:bg-teal-50"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* Delete Button with Safety Lock Guardrail */}
                            {isProtected ? (
                              <div
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 rounded text-[11px] font-medium border border-gray-200 cursor-not-allowed select-none"
                                title={`Cannot delete: ${productCount} active product(s) are assigned to this category. Reassign them first to prevent orphaned products.`}
                              >
                                <Lock className="w-3 h-3 text-gray-400" />
                                <span className="hidden sm:inline">Protected</span>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setCategoryToDelete(cat);
                                  setDeleteDialogOpen(true);
                                }}
                                title="Delete Empty Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {editingCategory
                ? "Update category details. Connected products will reflect these changes."
                : "Create a new product category. It will instantly be available when creating products."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">Category Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Solar Inverters & Panels"
                        {...field}
                        onChange={handleNameChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">URL Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. solar-inverters" {...field} />
                    </FormControl>
                    <p className="text-[11px] text-gray-400">Used in URLs: /products?category={field.value || "slug"}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary of products in this category..."
                        className="resize-none h-20 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image URL */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/category-image.jpg" {...field} />
                    </FormControl>
                    {field.value && (
                      <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={field.value}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingCategory
                    ? "Save Changes"
                    : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog (Only for empty categories) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category{" "}
              <strong className="text-gray-900 font-semibold">{categoryToDelete?.name}</strong>?
              <br />
              <br />
              This category currently has 0 products linked to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (categoryToDelete) {
                  deleteMutation.mutate(categoryToDelete.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold focus:ring-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
