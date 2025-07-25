import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ELECTRICAL_PRODUCT_TEMPLATES, ProductAttribute } from "../../../../shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Info, Zap, Settings, Award } from "lucide-react";
import { formatPrice } from "@/lib/currency";

// Dynamic form schema that adapts based on selected product template
const createDynamicProductSchema = (template?: keyof typeof ELECTRICAL_PRODUCT_TEMPLATES) => {
  const baseSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    originalPrice: z.number().optional(),
    sku: z.string().optional(),
    stock: z.number().min(0, "Stock must be 0 or greater"),
    categoryId: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    attributeTemplate: z.string().optional(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    specifications: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  });

  // Add dynamic validation based on template
  if (template && ELECTRICAL_PRODUCT_TEMPLATES[template]) {
    const templateData = ELECTRICAL_PRODUCT_TEMPLATES[template];
    const specificationSchema: Record<string, z.ZodType> = {};

    templateData.attributes.forEach((attr: ProductAttribute) => {
      if (attr.required) {
        switch (attr.type) {
          case 'text':
          case 'select':
            specificationSchema[attr.name] = z.string().min(1, `${attr.label} is required`);
            break;
          case 'number':
            specificationSchema[attr.name] = z.number().min(0, `${attr.label} must be positive`);
            break;
          case 'boolean':
            specificationSchema[attr.name] = z.boolean();
            break;
          case 'multi-select':
            specificationSchema[attr.name] = z.array(z.string()).min(1, `${attr.label} is required`);
            break;
        }
      }
    });

    return baseSchema.extend({
      specifications: z.object(specificationSchema).optional(),
    });
  }

  return baseSchema;
};

interface DynamicProductFormProps {
  product?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function DynamicProductForm({ product, onSubmit, isLoading }: DynamicProductFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof ELECTRICAL_PRODUCT_TEMPLATES | "">(
    product?.attributeTemplate || ""
  );

  const schema = createDynamicProductSchema(selectedTemplate || undefined);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      shortDescription: product?.shortDescription || "",
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      sku: product?.sku || "",
      stock: product?.stock || 0,
      categoryId: product?.categoryId || "",
      imageUrls: product?.imageUrls || [],
      attributeTemplate: product?.attributeTemplate || "",
      isFeatured: product?.isFeatured || false,
      isActive: product?.isActive !== false,
      specifications: product?.specifications || {},
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "imageUrls",
  });

  // Get current template data
  const templateData = selectedTemplate ? ELECTRICAL_PRODUCT_TEMPLATES[selectedTemplate] : null;

  // Handle template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template as keyof typeof ELECTRICAL_PRODUCT_TEMPLATES);
    form.setValue("attributeTemplate", template);
    
    // Clear existing specifications when changing template
    form.setValue("specifications", {});
  };

  // Group attributes by category for better UX
  const groupedAttributes = templateData?.attributes.reduce((groups, attr) => {
    if (!groups[attr.category]) {
      groups[attr.category] = [];
    }
    groups[attr.category].push(attr);
    return groups;
  }, {} as Record<string, ProductAttribute[]>) || {};

  const categoryIcons: Record<string, any> = {
    electrical: <Zap className="w-4 h-4" />,
    physical: <Settings className="w-4 h-4" />,
    certification: <Award className="w-4 h-4" />,
    general: <Info className="w-4 h-4" />,
    specifications: <Info className="w-4 h-4" />,
    features: <Plus className="w-4 h-4" />,
    safety: <Award className="w-4 h-4" />,
    environmental: <Settings className="w-4 h-4" />,
  };

  const renderAttributeField = (attr: ProductAttribute) => {
    const fieldName = `specifications.${attr.name}` as const;

    switch (attr.type) {
      case 'select':
        return (
          <FormField
            key={attr.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {attr.label}
                  {attr.unit && <Badge variant="outline">{attr.unit}</Badge>}
                  {attr.required && <Badge variant="destructive">Required</Badge>}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${attr.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {attr.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={attr.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {attr.label}
                  {attr.unit && <Badge variant="outline">{attr.unit}</Badge>}
                  {attr.required && <Badge variant="destructive">Required</Badge>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder={`Enter ${attr.label.toLowerCase()}`}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            key={attr.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {attr.label}
                    {attr.required && <Badge variant="destructive" className="ml-2">Required</Badge>}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'text':
      default:
        return (
          <FormField
            key={attr.name}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {attr.label}
                  {attr.unit && <Badge variant="outline">{attr.unit}</Badge>}
                  {attr.required && <Badge variant="destructive">Required</Badge>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter ${attr.label.toLowerCase()}`}
                    {...field}
                    value={field.value as string || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="product-url-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="PROD-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief product description for listings"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Product Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Product Type & Specifications</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select a product template to automatically generate relevant specification fields
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label htmlFor="template-select">Product Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Template (Custom Product)</SelectItem>
                      {Object.entries(ELECTRICAL_PRODUCT_TEMPLATES).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Specifications */}
                {templateData && (
                  <div className="space-y-6">
                    <Separator />
                    <div>
                      <h4 className="text-lg font-medium mb-4">Product Specifications</h4>
                      <Tabs defaultValue={Object.keys(groupedAttributes)[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-auto">
                          {Object.keys(groupedAttributes).map((category) => (
                            <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                              {categoryIcons[category]}
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {Object.entries(groupedAttributes).map(([category, attributes]) => (
                          <TabsContent key={category} value={category} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {attributes.map(renderAttributeField)}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings & Images */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Product</FormLabel>
                        <FormDescription>Show this product in featured sections</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>Product is visible to customers</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      {...form.register(`imageUrls.${index}` as const)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendImage("")}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}