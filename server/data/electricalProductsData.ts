// CopperBear Customer Products Data - Complete 25 Product Catalog
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

// Complete CopperBear customer products - All 25 products from CSV
export const AUTHENTIC_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  // Finolex Wires & Cables (4 products)
  {
    id: 'prod-001',
    name: '1.0sqmm Wire',
    slug: 'finolex-1-0sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 120500, // ₹1205.00
    originalPrice: 170000, // ₹1700.00
    sku: 'FIN010303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
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
    name: '1.5sqmm Wire',
    slug: 'finolex-1-5sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 1.5sqmm FR PVC insulated cable with copper conductor',
    price: 177900, // ₹1779.00
    originalPrice: 247500, // ₹2475.00
    sku: 'FIN015303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
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
    name: '2.5sqmm Wire',
    slug: 'finolex-2-5sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 2.5sqmm FR PVC insulated cable with copper conductor',
    price: 287900, // ₹2879.00
    originalPrice: 400000, // ₹4000.00
    sku: 'FIN025303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
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
    name: '4.0sqmm Wire',
    slug: 'finolex-4-0sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 4.0sqmm FR PVC insulated cable with copper conductor',
    price: 443900, // ₹4439.00
    originalPrice: 617000, // ₹6170.00
    sku: 'FIN040303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
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

  // Kundan Cable Wires & Cables (4 products)
  {
    id: 'prod-005',
    name: '1.0sqmm Wire',
    slug: 'kundan-1-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 104900, // ₹1049.00
    originalPrice: 214400, // ₹2144.00
    sku: 'KUN01020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
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
  {
    id: 'prod-006',
    name: '1.5sqmm Wire',
    slug: 'kundan-1-5sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 1.5sqmm FR PVC insulated cable with copper conductor',
    price: 159900, // ₹1599.00
    originalPrice: 326400, // ₹3264.00
    sku: 'KUN01520',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '1.5sqmm',
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
    rating: 4.4,
    reviewCount: 19
  },
  {
    id: 'prod-007',
    name: '2.5sqmm Wire',
    slug: 'kundan-2-5sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 2.5sqmm FR PVC insulated cable with copper conductor',
    price: 258100, // ₹2581.00
    originalPrice: 526900, // ₹5269.00
    sku: 'KUN02520',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '2.5sqmm',
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
    rating: 4.5,
    reviewCount: 16
  },
  {
    id: 'prod-008',
    name: '4.0sqmm Wire',
    slug: 'kundan-4-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 4.0sqmm FR PVC insulated cable with copper conductor',
    price: 380900, // ₹3809.00
    originalPrice: 777400, // ₹7774.00
    sku: 'KUN04020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '4.0sqmm',
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
    rating: 4.6,
    reviewCount: 13
  },

  // Sturlite LED Emergency Bulbs (3 products)
  {
    id: 'prod-009',
    name: '10W Inverter Bulb (3Hr Backup)',
    slug: 'sturlite-10w-inverter-bulb-3hr',
    description: 'SMD LED chip, CRI>80, IP20, Bright light output, charging 6-8 hours, over charge protection, 6k - 3Hr back up, 900Lumens, B22 base, Dimensions 70x140mm.',
    shortDescription: 'Sturlite 10W emergency LED bulb with 3 hour backup',
    price: 21408, // ₹214.08
    originalPrice: 44600, // ₹446.00
    sku: 'STU10EB3H',
    stock: 100,
    categoryId: 'cat-2',
    imageUrls: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop'],
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
  {
    id: 'prod-010',
    name: '10W Inverter Bulb (4Hr Backup)',
    slug: 'sturlite-10w-inverter-bulb-4hr',
    description: 'SMD LED chip, CRI>80, IP20, Bright light output, charging 6-8 hours, over charge protection, 6k - 4Hr back up, 900Lumens, B22 base, Dimensions 70x140mm.',
    shortDescription: 'Sturlite 10W emergency LED bulb with 4 hour backup',
    price: 22320, // ₹223.20
    originalPrice: 46500, // ₹465.00
    sku: 'STU10EB4H',
    stock: 100,
    categoryId: 'cat-2',
    imageUrls: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '10W',
      backup_time: '4 Hours',
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
    isFeatured: false,
    isActive: true,
    rating: 4.5,
    reviewCount: 38
  },
  {
    id: 'prod-011',
    name: '10W Inverter Bulb (6Hr Backup)',
    slug: 'sturlite-10w-inverter-bulb-6hr',
    description: 'SMD LED chip, CRI>80, IP20, Bright light output, charging 6-8 hours, over charge protection, 6k - 6Hr back up, 900Lumens, B22 base, Dimensions 70x140mm.',
    shortDescription: 'Sturlite 10W emergency LED bulb with 6 hour backup',
    price: 26640, // ₹266.40
    originalPrice: 55500, // ₹555.00
    sku: 'STU10EB6H',
    stock: 100,
    categoryId: 'cat-2',
    imageUrls: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '10W',
      backup_time: '6 Hours',
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
    rating: 4.7,
    reviewCount: 52
  },

  // Sturlite LED Flood Lights (8 products)
  {
    id: 'prod-012',
    name: '30W Flood Light',
    slug: 'sturlite-30w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 30W LED flood light with IP66 protection',
    price: 48720, // ₹487.20
    originalPrice: 101500, // ₹1015.00
    sku: 'STU0207-30W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
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
  {
    id: 'prod-013',
    name: '50W Flood Light',
    slug: 'sturlite-50w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 50W LED flood light with IP66 protection',
    price: 67200, // ₹672.00
    originalPrice: 140000, // ₹1400.00
    sku: 'STU0207-50W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '50W',
      lumens_per_watt: '100',
      total_lumens: '5000',
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
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 28
  },
  {
    id: 'prod-014',
    name: '100W Flood Light',
    slug: 'sturlite-100w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 100W LED flood light with IP66 protection',
    price: 110160, // ₹1101.60
    originalPrice: 229500, // ₹2295.00
    sku: 'STU0207-100W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '100W',
      lumens_per_watt: '100',
      total_lumens: '10000',
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
    rating: 4.8,
    reviewCount: 41
  },
  {
    id: 'prod-015',
    name: '150W Flood Light',
    slug: 'sturlite-150w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 150W LED flood light with IP66 protection',
    price: 185280, // ₹1852.80
    originalPrice: 386000, // ₹3860.00
    sku: 'STU0207-1500W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '150W',
      lumens_per_watt: '100',
      total_lumens: '15000',
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
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 22
  },
  {
    id: 'prod-016',
    name: '200W Flood Light',
    slug: 'sturlite-200w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 200W LED flood light with IP66 protection',
    price: 223680, // ₹2236.80
    originalPrice: 466000, // ₹4660.00
    sku: 'STU0207-200W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '200W',
      lumens_per_watt: '100',
      total_lumens: '20000',
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
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 19
  },
  {
    id: 'prod-017',
    name: '300W Flood Light',
    slug: 'sturlite-300w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 300W LED flood light with IP66 protection',
    price: 385200, // ₹3852.00
    originalPrice: 802500, // ₹8025.00
    sku: 'STU0207-300W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '300W',
      lumens_per_watt: '100',
      total_lumens: '30000',
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
    rating: 4.9,
    reviewCount: 15
  },
  {
    id: 'prod-018',
    name: '400W Flood Light',
    slug: 'sturlite-400w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 400W LED flood light with IP66 protection',
    price: 520800, // ₹5208.00
    originalPrice: 1085000, // ₹10850.00
    sku: 'STU0207-400W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '400W',
      lumens_per_watt: '100',
      total_lumens: '40000',
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
    isFeatured: false,
    isActive: true,
    rating: 4.9,
    reviewCount: 12
  },
  {
    id: 'prod-019',
    name: '500W Flood Light',
    slug: 'sturlite-500w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 500W LED flood light with IP66 protection',
    price: 753600, // ₹7536.00
    originalPrice: 1570000, // ₹15700.00
    sku: 'STU0207-500W',
    stock: 100,
    categoryId: 'cat-3',
    imageUrls: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '500W',
      lumens_per_watt: '100',
      total_lumens: '50000',
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
    rating: 5.0,
    reviewCount: 8
  },

  // Sturlite LED Street Lights (6 products)
  {
    id: 'prod-020',
    name: '20W Street Light',
    slug: 'sturlite-20w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 2200 Lumens, 300x103x46mm Dimension',
    shortDescription: 'Sturlite 20W LED street light with 2200 lumens',
    price: 56650, // ₹566.50
    originalPrice: 118000, // ₹1180.00
    sku: 'STU0060-20W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
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
  },
  {
    id: 'prod-021',
    name: '24W Street Light',
    slug: 'sturlite-24w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 2640 Lumens, 300x103x46mm Dimension',
    shortDescription: 'Sturlite 24W LED street light with 2640 lumens',
    price: 58800, // ₹588.00
    originalPrice: 122500, // ₹1225.00
    sku: 'STU0060-24W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '24W',
      lumens_per_watt: '110',
      total_lumens: '2640',
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
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 27
  },
  {
    id: 'prod-022',
    name: '30W Street Light',
    slug: 'sturlite-30w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, Lumens 3300, 340x124x47mm dimension',
    shortDescription: 'Sturlite 30W LED street light with 3300 lumens',
    price: 75600, // ₹756.00
    originalPrice: 157500, // ₹1575.00
    sku: 'STU0060-30W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '30W',
      lumens_per_watt: '110',
      total_lumens: '3300',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '340x124x47mm',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 33
  },
  {
    id: 'prod-023',
    name: '36W Street Light',
    slug: 'sturlite-36w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 3960 Lumens, 340x124x47mm Dimension',
    shortDescription: 'Sturlite 36W LED street light with 3960 lumens',
    price: 78240, // ₹782.40
    originalPrice: 163000, // ₹1630.00
    sku: 'STU0060-36W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '36W',
      lumens_per_watt: '110',
      total_lumens: '3960',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '340x124x47mm',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 24
  },
  {
    id: 'prod-024',
    name: '50W Street Light',
    slug: 'sturlite-50w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 5500 Lumens, 391x145x50mm Dimension',
    shortDescription: 'Sturlite 50W LED street light with 5500 lumens',
    price: 95000, // ₹950.00
    originalPrice: 198000, // ₹1980.00
    sku: 'STU0060-50W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '50W',
      lumens_per_watt: '110',
      total_lumens: '5500',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '391x145x50mm',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 29
  },
  {
    id: 'prod-025',
    name: '72W Street Light',
    slug: 'sturlite-72w-street-light',
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 7920 Lumens, 390x145x50mm Dimension',
    shortDescription: 'Sturlite 72W LED street light with 7920 lumens',
    price: 140400, // ₹1404.00
    originalPrice: 292500, // ₹2925.00
    sku: 'STU0060-72W',
    stock: 100,
    categoryId: 'cat-4',
    imageUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop'],
    specifications: {
      wattage: '72W',
      lumens_per_watt: '110',
      total_lumens: '7920',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '390x145x50mm',
      led_chip: 'SMD LED',
      cri: '>80',
      brand: 'Sturlite',
      warranty: '2 year warranty',
      discount: '52%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 21
  }
];

// Development data service with timestamp handling for complete customer products
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