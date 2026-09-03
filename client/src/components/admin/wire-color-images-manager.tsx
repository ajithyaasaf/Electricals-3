import { useState } from "react";
import { Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WIRE_COLORS } from "@shared/data/products";

interface WireColorImagesManagerProps {
  colors: string[];
  colorImages?: Record<string, string>;
  onChange: (colorImages: Record<string, string>) => void;
}

export function WireColorImagesManager({
  colors,
  colorImages = {},
  onChange,
}: WireColorImagesManagerProps) {
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async (colorName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColor(colorName);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "copperbear/products/main");
      const res = await apiRequest("POST", "/api/upload/image", formData);
      const data = await res.json();

      if (data.success && data.url) {
        onChange({
          ...colorImages,
          [colorName]: data.url,
        });
        toast({
          title: "Color photo uploaded",
          description: `Uploaded photo for ${colorName} wire`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: data.message || "Could not upload image",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingColor(null);
      e.target.value = "";
    }
  };

  const handleRemove = (colorName: string) => {
    const updated = { ...colorImages };
    delete updated[colorName];
    onChange(updated);
    toast({
      title: "Color photo removed",
      description: `Removed custom photo for ${colorName} wire`,
    });
  };

  if (colors.length === 0) return null;

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            Color-Specific Coil Photos <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500">
            Upload individual coil photos for each color. When buyers switch colors on your store, the main product image will automatically switch to match.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {colors.map((colorName) => {
          const colorObj = WIRE_COLORS.find(
            (c) => c.name.toLowerCase() === colorName.toLowerCase()
          ) || {
            name: colorName,
            hex: "#888888",
            borderHex: "#666666",
          };
          const imageUrl = colorImages[colorName];
          const isUploading = uploadingColor === colorName;

          return (
            <div
              key={colorName}
              className="flex flex-col p-2.5 rounded-lg border border-gray-200 bg-gray-50/60 gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border shadow-2xs shrink-0"
                    style={{ backgroundColor: colorObj.hex, borderColor: colorObj.borderHex }}
                  />
                  <span className="text-xs font-semibold text-gray-900">{colorName}</span>
                </div>
                {imageUrl && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 py-0">
                    Photo Added
                  </Badge>
                )}
              </div>

              {imageUrl ? (
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-white border border-gray-200 group">
                  <img
                    src={imageUrl}
                    alt={`${colorName} wire`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer p-1.5 bg-white text-gray-800 rounded-md hover:bg-gray-100 shadow-xs text-xs font-medium">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(colorName, e)}
                        disabled={isUploading}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRemove(colorName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-300 hover:border-amber-400 bg-white rounded-md cursor-pointer transition-colors hover:bg-amber-50/30">
                  {isUploading ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-amber-700">
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      <span>Upload {colorName} Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(colorName, e)}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
