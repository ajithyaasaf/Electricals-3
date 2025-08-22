// CopperBear Customer Products Data - Authentic Electrical Products
// Real customer product data with proper specifications and market pricing

import type { Category, Product } from '@shared/types';

// CopperBear product categories based on customer data
export const AUTHENTIC_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-1',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'Flame retardant PVC insulated cables, copper conductors, industrial wiring solutions',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-2',
    name: 'LED Emergency Bulb',
    slug: 'led-emergency-bulb',
    description: 'Emergency LED bulbs with backup power, inverter bulbs for power outages',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-3',
    name: 'LED Flood Light',
    slug: 'led-flood-light',
    description: 'High-performance LED flood lights, IP66 rated, commercial and industrial lighting',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-4',
    name: 'LED Street Light',
    slug: 'led-street-light',
    description: 'Energy-efficient LED street lights, IP66 protection, urban and highway lighting',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop',
  }
];

// CopperBear customer products with real market data and specifications  
export const AUTHENTIC_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  // Finolex Wires & Cables
  {
    id: 'prod-001',
    name: '1.0sqmm Wire - Finolex',
    slug: 'finolex-1-0sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 120500, // ₹1205.00
    originalPrice: 170000, // ₹1700.00
    sku: 'FIN010303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      size: '1.0sqmm',
      brand: 'Finolex',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '40%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.5,
    reviewCount: 25
  },
  {
    id: 'prod-002',
    name: '1.5sqmm Wire - Finolex',
    slug: 'finolex-1-5sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 1.5sqmm FR PVC insulated cable with copper conductor',
    price: 177900,
    originalPrice: 247500,
    sku: 'FIN015303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      size: '1.5sqmm',
      brand: 'Finolex',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '39%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.6,
    reviewCount: 32
  },
  {
    id: 'prod-003',
    name: '2.5sqmm Wire - Finolex',
    slug: 'finolex-2-5sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 2.5sqmm FR PVC insulated cable with copper conductor',
    price: 287900,
    originalPrice: 400000,
    sku: 'FIN025303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      size: '2.5sqmm',
      brand: 'Finolex',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '39%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 18
  },
  {
    id: 'prod-004',
    name: '4.0sqmm Wire - Finolex',
    slug: 'finolex-4-0sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 4.0sqmm FR PVC insulated cable with copper conductor',
    price: 443900,
    originalPrice: 617000,
    sku: 'FIN040303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      size: '4.0sqmm',
      brand: 'Finolex',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '39%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 14
  },

  // Kundan Cable Wires & Cables
  {
    id: 'prod-005',
    name: '1.0sqmm Wire - Kundan Cable',
    slug: 'kundan-1-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 104900,
    originalPrice: 214400,
    sku: 'KUN01020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      size: '1.0sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '51%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.3,
    reviewCount: 22
  },

  // Sturlite LED Emergency Bulbs
  {
    id: 'prod-009',
    name: '10W Inverter Bulb (3Hr Backup) - Sturlite',
    slug: 'sturlite-10w-inverter-bulb-3hr',
    description: 'SMD LED chip, CRI>80, IP20, Bright light output, charging 6-8 hours, over charge protection, 6k - 3Hr back up, 900Lumens, B22 base, Dimensions 70x140mm.',
    shortDescription: 'Sturlite 10W emergency LED bulb with 3 hour backup',
    price: 21408,
    originalPrice: 44600,
    sku: 'STU10EB3H',
    stock: 100,
    categoryId: 'cat-2',
    imageUrls: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop'
    ],
    specifications: {
      wattage: '10W',
      backup_time: '3 Hours',
      lumens: '900',
      base_type: 'B22',
      led_chip: 'SMD LED',
      cri: '>80',
      ip_rating: 'IP20',
      dimensions: '70x140mm',
      brand: 'Sturlite',
      warranty: '1 year replacement',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.4,
    reviewCount: 45
  },

  // Sturlite LED Flood Lights
  {
    id: 'prod-012',
    name: '30W Flood Light - Sturlite',
    slug: 'sturlite-30w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 30W LED flood light with IP66 protection',
    price: 48720,
    originalPrice: 101500,
    sku: 'STU0207-30W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'
    ],
    specifications: {
      wattage: '30W',
      lumens_per_watt: '100',
      total_lumens: '3000',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '25000 hours',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.6,
    reviewCount: 34
  },

  // Sturlite LED Street Lights
  {
    id: 'prod-020',
    name: '20W Street Light - Sturlite',
    slug: 'sturlite-20w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 2200 Lumens, 300x103x46mm Dimension',
    shortDescription: 'Sturlite 20W LED street light with 2200 lumens',
    price: 56650,
    originalPrice: 118000,
    sku: 'STU0060-20W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: [
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'
    ],
    specifications: {
      wattage: '20W',
      lumens_per_watt: '110',
      total_lumens: '2200',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '300x103x46mm',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.5,
    reviewCount: 31
  }
];

// Development data service with timestamp handling for customer products
export class AuthenticElectricalDataService {
  static getCategories(): (Category & { createdAt: Date; updatedAt: Date })[] {
    return AUTHENTIC_CATEGORIES.map(cat => ({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static getProducts(): (Product & { createdAt: Date; updatedAt: Date })[] {
    return AUTHENTIC_PRODUCTS.map(prod => ({
      ...prod,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  static getFeaturedProducts(): (Product & { createdAt: Date; updatedAt: Date })[] {
    return this.getProducts().filter(p => p.isFeatured);
  }

  static getProductsByCategory(categoryId: string): (Product & { createdAt: Date; updatedAt: Date })[] {
    return this.getProducts().filter(p => p.categoryId === categoryId);
  }

  static searchProducts(query: string): (Product & { createdAt: Date; updatedAt: Date })[] {
    const searchTerm = query.toLowerCase();
    return this.getProducts().filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.shortDescription?.toLowerCase().includes(searchTerm) ||
      p.sku?.toLowerCase().includes(searchTerm)
    );
  }

  static getProductById(id: string): (Product & { createdAt: Date; updatedAt: Date }) | null {
    return this.getProducts().find(p => p.id === id) || null;
  }

  static getCategoryById(id: string): (Category & { createdAt: Date; updatedAt: Date }) | null {
    return this.getCategories().find(c => c.id === id) || null;
  }
}