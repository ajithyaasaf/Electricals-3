import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, MoveUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    className?: string;
}

export function ImageUpload({
    images,
    onChange,
    maxImages = 5,
    className
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (images.length + acceptedFiles.length > maxImages) {
            toast({
                title: "Too many images",
                description: `Maximum ${maxImages} images allowed`,
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        try {
            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append('image', file);

                const fileId = Math.random().toString(36);
                setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

                try {
                    const response = await apiRequest('POST', '/api/upload/image', formData);
                    const data = await response.json();

                    if (data.success && data.url) {
                        newImages.push(data.url);
                    } else {
                        console.error('Upload failed:', data.message);
                        toast({
                            title: "Upload failed",
                            description: data.message || `Failed to upload ${file.name}`,
                            variant: "destructive",
                        });
                    }
                } catch (error) {
                    console.error('Upload error for file:', file.name, error);
                    toast({
                        title: "Upload failed",
                        description: `Failed to upload ${file.name}`,
                        variant: "destructive",
                    });
                }

                setUploadProgress(prev => {
                    const updated = { ...prev };
                    delete updated[fileId];
                    return updated;
                });
            }

            if (newImages.length > 0) {
                onChange([...images, ...newImages]);

                toast({
                    title: "Images uploaded",
                    description: `Successfully uploaded ${newImages.length} image(s)`,
                });
            }
        } catch (error) {
            console.error('Upload batch error:', error);
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    }, [images, maxImages, onChange, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        disabled: uploading || images.length >= maxImages,
    });

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const moveToFirst = (index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        const [removed] = newImages.splice(index, 1);
        newImages.unshift(removed);
        onChange(newImages);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 hover:border-teal-500 transition-colors"
                        >
                            <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Primary badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded shadow-sm">
                                    Primary
                                </div>
                            )}

                            {/* Overlay controls */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => moveToFirst(index)}
                                        className="text-xs h-8"
                                        title="Make primary image"
                                    >
                                        <MoveUp className="h-3 w-3 mr-1" />
                                        Primary
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => removeImage(index)}
                                    className="h-8 w-8"
                                    title="Remove image"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-teal-600 flex-shrink-0" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{progress}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Dropzone */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                        isDragActive
                            ? "border-teal-600 bg-teal-50"
                            : "border-gray-300 hover:border-teal-500 hover:bg-gray-50",
                        uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Uploading images...</p>
                                    <p className="text-xs text-gray-500 mt-1">Please wait</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-teal-50 rounded-full">
                                    <Upload className="h-8 w-8 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {isDragActive ? "Drop images here" : "Drag & drop images or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, WebP up to 5MB • {images.length}/{maxImages} uploaded
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {images.length >= maxImages && (
                <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                        Maximum {maxImages} images reached. Remove some to upload more.
                    </p>
                </div>
            )}
        </div>
    );
}
