// CopperBear Customer Products Data - Complete 25 Product Catalog
// Real customer product data with proper specifications and market pricing

import type { Category, Product } from '@shared/types';
import { ELECTRICAL_CATEGORIES } from '@shared/data/categories';

// Import categories from shared source to ensure consistency
export const AUTHENTIC_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = ELECTRICAL_CATEGORIES;

// Complete CopperBear customer products - All 25 products from CSV
export const AUTHENTIC_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  // Finolex Wires & Cables (4 products)
  {
    id: 'prod-001',
    name: '1.0sqmm Wire',
    slug: 'finolex-1-0sqmm-wire',
    description: 'Finolex Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Finolex 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 1205, // ₹1205.00
    originalPrice: 1700, // ₹1700.00
    sku: 'FIN010303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/finolex-wire.jpg'],
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
    price: 1779, // ₹1779.00
    originalPrice: 2475, // ₹2475.00
    sku: 'FIN015303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/finolex-wire.jpg'],
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
    price: 2879, // ₹2879.00
    originalPrice: 4000, // ₹4000.00
    sku: 'FIN025303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/finolex-wire.jpg'],
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
    price: 4439, // ₹4439.00
    originalPrice: 6170, // ₹6170.00
    sku: 'FIN040303S',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/finolex-wire.jpg'],
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
    reviewCount: 22
  },

  // Kundan Cable Wires & Cables (4 products)
  {
    id: 'prod-005',
    name: '1.0sqmm Wire',
    slug: 'kundan-1-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 1.0sqmm FR PVC insulated cable with copper conductor',
    price: 1049, // ₹1049.00
    originalPrice: 2144, // ₹2144.00
    sku: 'KUN01020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/kundan-wire.jpg'],
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
    isFeatured: true,
    isActive: true,
    rating: 4.3,
    reviewCount: 19
  },
  {
    id: 'prod-006',
    name: '1.5sqmm Wire',
    slug: 'kundan-1-5sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 1.5sqmm FR PVC insulated cable with copper conductor',
    price: 1599, // ₹1599.00
    originalPrice: 3264, // ₹3264.00
    sku: 'KUN01520',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/kundan-wire.jpg'],
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
    reviewCount: 16
  },
  {
    id: 'prod-007',
    name: '2.5sqmm Wire',
    slug: 'kundan-2-5sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 2.5sqmm FR PVC insulated cable with copper conductor',
    price: 2581, // ₹2581.00
    originalPrice: 5269, // ₹5269.00
    sku: 'KUN02520',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/kundan-wire.jpg'],
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
    reviewCount: 14
  },
  {
    id: 'prod-008',
    name: '4.0sqmm Wire',
    slug: 'kundan-4-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 4.0sqmm FR PVC insulated cable with copper conductor',
    price: 3809, // ₹3809.00
    originalPrice: 7774, // ₹7774.00
    sku: 'KUN04020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['/products/kundan-wire.jpg'],
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
    price: 214.08, // ₹214.08
    originalPrice: 446, // ₹446.00
    sku: 'STU10EB3H',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-inverter-bulb.jpg'],
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
    price: 223.2, // ₹223.20
    originalPrice: 465, // ₹465.00
    sku: 'STU10EB4H',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-inverter-bulb.jpg'],
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
    price: 266.4, // ₹266.40
    originalPrice: 555, // ₹555.00
    sku: 'STU10EB6H',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-inverter-bulb.jpg'],
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
    price: 487.2, // ₹487.20
    originalPrice: 1015, // ₹1015.00
    sku: 'STU0207-30W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-30w.jpg'],
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
    price: 672, // ₹672.00
    originalPrice: 1400, // ₹1400.00
    sku: 'STU0207-50W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-50w.jpg'],
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
    price: 1101.6, // ₹1101.60
    originalPrice: 2295, // ₹2295.00
    sku: 'STU0207-100W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-100w.jpg'],
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
    reviewCount: 22
  },
  {
    id: 'prod-015',
    name: '150W Flood Light',
    slug: 'sturlite-150w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 150W LED flood light with IP66 protection',
    price: 1852.8, // ₹1852.80
    originalPrice: 3860, // ₹3860.00
    sku: 'STU0207-1500W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-150w.jpg'],
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
    rating: 4.6,
    reviewCount: 19
  },
  {
    id: 'prod-016',
    name: '200W Flood Light',
    slug: 'sturlite-200w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 200W LED flood light with IP66 protection',
    price: 2236.8, // ₹2236.80
    originalPrice: 4660, // ₹4660.00
    sku: 'STU0207-200W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-200w.jpg'],
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
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 15
  },
  {
    id: 'prod-017',
    name: '300W Flood Light',
    slug: 'sturlite-300w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 300W LED flood light with IP66 protection',
    price: 3852, // ₹3852.00
    originalPrice: 8025, // ₹8025.00
    sku: 'STU0207-300W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-300w-500w.png'],
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
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 12
  },
  {
    id: 'prod-018',
    name: '400W Flood Light',
    slug: 'sturlite-400w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 400W LED flood light with IP66 protection',
    price: 5208, // ₹5208.00
    originalPrice: 10850, // ₹10850.00
    sku: 'STU0207-400W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-300w-500w.png'],
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
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 9
  },
  {
    id: 'prod-019',
    name: '500W Flood Light',
    slug: 'sturlite-500w-flood-light',
    description: 'SMD LED chip, CRI>80, 25000hrs life span, IP66, ADC12 Diecast housing rust proof, Adjustable bracket, upto 6.0KV Surge protection, 100Lumen/watt',
    shortDescription: 'Sturlite 500W LED flood light with IP66 protection',
    price: 7536, // ₹7536.00
    originalPrice: 15700, // ₹15700.00
    sku: 'STU0207-500W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-flood-300w-500w.png'],
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
    price: 566.5, // ₹566.50
    originalPrice: 1180, // ₹1180.00
    sku: 'STU0060-20W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-20w.jpg'],
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
    price: 588, // ₹588.00
    originalPrice: 1225, // ₹1225.00
    sku: 'STU0060-24W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-24w.jpg'],
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
    price: 756, // ₹756.00
    originalPrice: 1575, // ₹1575.00
    sku: 'STU0060-30W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-30w.jpg'],
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
    price: 782.4, // ₹782.40
    originalPrice: 1630, // ₹1630.00
    sku: 'STU0060-36W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-36w.jpg'],
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
    price: 950, // ₹950.00
    originalPrice: 1980, // ₹1980.00
    sku: 'STU0060-50W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-50w.jpg'],
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
    description: 'SMD LED chip, CRI>80, 50000hrs life span, IP66, ADC12 Diecast housing rust proof, upto 6.0KV Surge protection, 110Lumen/watt, 7920 Lumens, 3390x145x50mm Dimension',
    shortDescription: 'Sturlite 72W LED street light with 7920 lumens',
    price: 1404, // ₹1404.00
    originalPrice: 2925, // ₹2925.00
    sku: 'STU0060-72W',
    stock: 100,
    categoryId: 'cat-6',
    imageUrls: ['/products/sturlite-street-72w.png'],
    specifications: {
      wattage: '72W',
      lumens_per_watt: '110',
      total_lumens: '7920',
      ip_rating: 'IP66',
      housing: 'ADC12 Diecast',
      surge_protection: '6.0KV',
      lifespan: '50000 hours',
      dimensions: '3390x145x50mm',
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
    return this.getProducts().filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm)) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
      (product.specifications?.brand && 
       product.specifications.brand.toLowerCase().includes(searchTerm))
    );
  }

  static getProductById(id: string): (Product & { createdAt: Date; updatedAt: Date }) | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  static getProductBySlug(slug: string): (Product & { createdAt: Date; updatedAt: Date }) | undefined {
    return this.getProducts().find(p => p.slug === slug);
  }
}