import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  Shield,
  Clock,
  Award,
  Users,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Icon mapping for the editor
const iconOptions = [
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Clock', label: 'Clock', icon: Clock },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'CheckCircle', label: 'Check Circle', icon: CheckCircle },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
  { value: 'Phone', label: 'Phone', icon: Phone },
  { value: 'MapPin', label: 'Map Pin', icon: MapPin },
];

interface FeatureData {
  id: string;
  icon: string;
  title: string;
  benefit: string;
  stat?: {
    value: string;
    label: string;
  };
  order?: number;
}

interface WhyChooseEditorData {
  headline: string;
  bulletReasons: string[];
  ctaText: string;
  features: FeatureData[];
}

/**
 * Admin Editor for Why Choose CopperBear Section
 * 
 * This component allows admins to edit the Why Choose section content
 * in real-time. Changes are automatically saved to Firestore and 
 * reflected live on the frontend.
 * 
 * Features:
 * - Edit headline, bullet points, and CTA text
 * - Add, remove, and reorder feature cards
 * - Select icons from predefined options
 * - Real-time preview and save functionality
 * - Validation and error handling
 */
const WhyChooseEditor: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [data, setData] = useState<WhyChooseEditorData>({
    headline: "Why Choose CopperBear Electrical?",
    bulletReasons: [
      "Licensed professionals with 15+ years experience",
      "24/7 emergency service with quick response time",
      "Quality guarantee with lifetime warranty coverage"
    ],
    ctaText: "Get Free Quote",
    features: [
      {
        id: "certified",
        icon: "Shield",
        title: "Certified Experts",
        benefit: "Licensed electricians you can trust",
        stat: { value: "98%", label: "Customer satisfaction" },
        order: 1
      },
      {
        id: "fast-service",
        icon: "Clock",
        title: "Fast Response",
        benefit: "Emergency service available 24/7",
        stat: { value: "Quick", label: "Response time" },
        order: 2
      },
      {
        id: "warranty",
        icon: "Award",
        title: "Quality Guarantee",
        benefit: "Lifetime warranty on all work",
        stat: { value: "100%", label: "Work guaranteed" },
        order: 3
      },
      {
        id: "experience",
        icon: "Users",
        title: "Experienced Team",
        benefit: "15+ years serving customers",
        stat: { value: "15+", label: "Years experience" },
        order: 4
      },
      {
        id: "modern-solutions",
        icon: "Zap",
        title: "Modern Solutions",
        benefit: "Latest electrical technology",
        stat: { value: "5⭐", label: "Google rating" },
        order: 5
      },
      {
        id: "local-trusted",
        icon: "MapPin",
        title: "Local & Trusted",
        benefit: "Serving your community",
        stat: { value: "1000+", label: "Projects completed" },
        order: 6
      }
    ]
  });

  // Load data from backend API on component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load site content from backend API
   * Uses the new /api/admin/site-content endpoint instead of direct Firestore
   */
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/admin/site-content/whyChooseSection');

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Merge fetched data with defaults to ensure all fields exist
          setData(prev => ({
            ...prev,
            headline: result.data.headline || prev.headline,
            bulletReasons: result.data.bulletReasons || prev.bulletReasons,
            ctaText: result.data.ctaText || prev.ctaText,
            features: result.data.features || prev.features,
          }));
        }
      } else if (response.status === 404) {
        // Document doesn't exist yet, use defaults
        console.log('[WhyChooseEditor] No existing content found, using defaults');
      } else {
        throw new Error('Failed to load content');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error Loading Data",
        description: "Could not load the current section data. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save site content via backend API
   * Uses PUT /api/admin/site-content endpoint with Zod validation on backend
   */
  const saveData = async () => {
    setSaving(true);
    try {
      const response = await apiRequest('PUT', '/api/admin/site-content/whyChooseSection', data);
      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Failed to save');
      }

      toast({
        title: "Changes Saved",
        description: "Why Choose section updated successfully!",
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const newFeature: FeatureData = {
      id: `feature-${Date.now()}`,
      icon: 'Shield',
      title: 'New Feature',
      benefit: 'Feature description',
      stat: { value: '100%', label: 'Success rate' },
      order: data.features.length + 1
    };
    setData({ ...data, features: [...data.features, newFeature] });
  };

  const removeFeature = (id: string) => {
    setData({
      ...data,
      features: data.features.filter(f => f.id !== id)
    });
  };

  const updateFeature = (id: string, updates: Partial<FeatureData>) => {
    setData({
      ...data,
      features: data.features.map(f =>
        f.id === id ? { ...f, ...updates } : f
      )
    });
  };

  const addBulletReason = () => {
    setData({
      ...data,
      bulletReasons: [...data.bulletReasons, 'New reason']
    });
  };

  const updateBulletReason = (index: number, value: string) => {
    const newReasons = [...data.bulletReasons];
    newReasons[index] = value;
    setData({ ...data, bulletReasons: newReasons });
  };

  const removeBulletReason = (index: number) => {
    setData({
      ...data,
      bulletReasons: data.bulletReasons.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="why-choose-editor">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Why Choose Section Editor</h2>
          <p className="text-muted-foreground">Edit the Why Choose CopperBear section content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={saveData}
            disabled={isSaving}
            data-testid="save-button"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hero Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Headline */}
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={data.headline}
                onChange={(e) => setData({ ...data, headline: e.target.value })}
                placeholder="Section headline"
                data-testid="headline-input"
              />
            </div>

            {/* Bullet Reasons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Bullet Reasons</Label>
                <Button size="sm" variant="outline" onClick={addBulletReason}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {data.bulletReasons.map((reason, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={reason}
                      onChange={(e) => updateBulletReason(index, e.target.value)}
                      placeholder="Reason description"
                      className="resize-none"
                      rows={2}
                      data-testid={`bullet-reason-${index}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeBulletReason(index)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Text */}
            <div>
              <Label htmlFor="cta-text">CTA Button Text</Label>
              <Input
                id="cta-text"
                value={data.ctaText}
                onChange={(e) => setData({ ...data, ctaText: e.target.value })}
                placeholder="Call to action text"
                data-testid="cta-text-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feature Cards</CardTitle>
              <Button size="sm" onClick={addFeature} data-testid="add-feature-button">
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.features.map((feature) => (
                <div
                  key={feature.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`feature-editor-${feature.id}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Order: {feature.order}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFeature(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Icon</Label>
                      <Select
                        value={feature.icon}
                        onValueChange={(value) => updateFeature(feature.id, { icon: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={feature.order}
                        onChange={(e) => updateFeature(feature.id, { order: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => updateFeature(feature.id, { title: e.target.value })}
                      placeholder="Feature title"
                    />
                  </div>

                  <div>
                    <Label>Benefit</Label>
                    <Textarea
                      value={feature.benefit}
                      onChange={(e) => updateFeature(feature.id, { benefit: e.target.value })}
                      placeholder="Feature benefit description"
                      rows={2}
                    />
                  </div>

                  {feature.stat && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Stat Value</Label>
                        <Input
                          value={feature.stat?.value || ''}
                          onChange={(e) => updateFeature(feature.id, {
                            stat: { ...feature.stat!, value: e.target.value }
                          })}
                          placeholder="e.g., 98%, 24/7"
                        />
                      </div>
                      <div>
                        <Label>Stat Label</Label>
                        <Input
                          value={feature.stat?.label || ''}
                          onChange={(e) => updateFeature(feature.id, {
                            stat: { ...feature.stat!, label: e.target.value }
                          })}
                          placeholder="e.g., Success rate"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 bg-muted rounded-lg">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Live preview would show here. Connect to the Why Choose component for real-time preview.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhyChooseEditor;