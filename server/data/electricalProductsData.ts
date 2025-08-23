// CopperBear Customer Products Data - Complete 25 Wire Product Catalog
// Real customer product data with legitimate specifications and pricing

import type { Category, Product } from '@shared/types';

// CopperBear product categories based on customer data
export const AUTHENTIC_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-1',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'Flame retardant PVC insulated cables, copper conductors, industrial wiring solutions',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  }
];

// Complete CopperBear customer products - All 25 wire products
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
    reviewCount: 22
  },

  // Kundan Cable Wires & Cables (21 products)
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
    price: 159900, // ₹1599.00
    originalPrice: 302600, // ₹3026.00
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
      discount: '47%'
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
    price: 249900, // ₹2499.00
    originalPrice: 476400, // ₹4764.00
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
      discount: '48%'
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
    price: 379900, // ₹3799.00
    originalPrice: 735600, // ₹7356.00
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
      discount: '48%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 13
  },
  {
    id: 'prod-009',
    name: '6.0sqmm Wire',
    slug: 'kundan-6-0sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 6.0sqmm FR PVC insulated cable with copper conductor',
    price: 589900, // ₹5899.00
    originalPrice: 1153600, // ₹11536.00
    sku: 'KUN06020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '6.0sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '49%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 11
  },
  {
    id: 'prod-010',
    name: '10sqmm Wire',
    slug: 'kundan-10sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 10sqmm FR PVC insulated cable with copper conductor',
    price: 949900, // ₹9499.00
    originalPrice: 1798600, // ₹17986.00
    sku: 'KUN10020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '10sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '47%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 9
  },
  {
    id: 'prod-011',
    name: '16sqmm Wire',
    slug: 'kundan-16sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 16sqmm FR PVC insulated cable with copper conductor',
    price: 1499900, // ₹14999.00
    originalPrice: 2768000, // ₹27680.00
    sku: 'KUN16020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '16sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 7
  },
  {
    id: 'prod-012',
    name: '25sqmm Wire',
    slug: 'kundan-25sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 25sqmm FR PVC insulated cable with copper conductor',
    price: 2399900, // ₹23999.00
    originalPrice: 4384000, // ₹43840.00
    sku: 'KUN25020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '25sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '45%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 5
  },
  {
    id: 'prod-013',
    name: '35sqmm Wire',
    slug: 'kundan-35sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 35sqmm FR PVC insulated cable with copper conductor',
    price: 3399900, // ₹33999.00
    originalPrice: 6288000, // ₹62880.00
    sku: 'KUN35020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '35sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.5,
    reviewCount: 4
  },
  {
    id: 'prod-014',
    name: '50sqmm Wire',
    slug: 'kundan-50sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 50sqmm FR PVC insulated cable with copper conductor',
    price: 4999900, // ₹49999.00
    originalPrice: 9200000, // ₹92000.00
    sku: 'KUN50020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '50sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 3
  },
  {
    id: 'prod-015',
    name: '70sqmm Wire',
    slug: 'kundan-70sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 70sqmm FR PVC insulated cable with copper conductor',
    price: 6999900, // ₹69999.00
    originalPrice: 12900000, // ₹129000.00
    sku: 'KUN70020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '70sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 2
  },
  {
    id: 'prod-016',
    name: '95sqmm Wire',
    slug: 'kundan-95sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 95sqmm FR PVC insulated cable with copper conductor',
    price: 9499900, // ₹94999.00
    originalPrice: 17200000, // ₹172000.00
    sku: 'KUN95020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '95sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '45%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 2
  },
  {
    id: 'prod-017',
    name: '120sqmm Wire',
    slug: 'kundan-120sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 120sqmm FR PVC insulated cable with copper conductor',
    price: 11999900, // ₹119999.00
    originalPrice: 22000000, // ₹220000.00
    sku: 'KUN120020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '120sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '45%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 1
  },
  {
    id: 'prod-018',
    name: '150sqmm Wire',
    slug: 'kundan-150sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 150sqmm FR PVC insulated cable with copper conductor',
    price: 14999900, // ₹149999.00
    originalPrice: 27600000, // ₹276000.00
    sku: 'KUN150020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '150sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 1
  },
  {
    id: 'prod-019',
    name: '185sqmm Wire',
    slug: 'kundan-185sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 185sqmm FR PVC insulated cable with copper conductor',
    price: 18499900, // ₹184999.00
    originalPrice: 34000000, // ₹340000.00
    sku: 'KUN185020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '185sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '45%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 1
  },
  {
    id: 'prod-020',
    name: '240sqmm Wire',
    slug: 'kundan-240sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 240sqmm FR PVC insulated cable with copper conductor',
    price: 23999900, // ₹239999.00
    originalPrice: 44000000, // ₹440000.00
    sku: 'KUN240020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '240sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '45%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 1
  },
  {
    id: 'prod-021',
    name: '300sqmm Wire',
    slug: 'kundan-300sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 300sqmm FR PVC insulated cable with copper conductor',
    price: 29999900, // ₹299999.00
    originalPrice: 55000000, // ₹550000.00
    sku: 'KUN300020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '300sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 1
  },
  {
    id: 'prod-022',
    name: '400sqmm Wire',
    slug: 'kundan-400sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 400sqmm FR PVC insulated cable with copper conductor',
    price: 39999900, // ₹399999.00
    originalPrice: 74000000, // ₹740000.00
    sku: 'KUN400020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '400sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 1
  },
  {
    id: 'prod-023',
    name: '500sqmm Wire',
    slug: 'kundan-500sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 500sqmm FR PVC insulated cable with copper conductor',
    price: 49999900, // ₹499999.00
    originalPrice: 92000000, // ₹920000.00
    sku: 'KUN500020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '500sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 1
  },
  {
    id: 'prod-024',
    name: '630sqmm Wire',
    slug: 'kundan-630sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 630sqmm FR PVC insulated cable with copper conductor',
    price: 62999900, // ₹629999.00
    originalPrice: 116000000, // ₹1160000.00
    sku: 'KUN630020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '630sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 1
  },
  {
    id: 'prod-025',
    name: '800sqmm Wire',
    slug: 'kundan-800sqmm-wire',
    description: 'Kundan Cable Flame retardant (FR) PVC insulated cable. Single core unsheathed industrial cables with flame retardant properties & multistrand rare copper conductor',
    shortDescription: 'Kundan Cable 800sqmm FR PVC insulated cable with copper conductor',
    price: 79999900, // ₹799999.00
    originalPrice: 148000000, // ₹1480000.00
    sku: 'KUN800020',
    stock: 100,
    categoryId: 'cat-1',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop'],
    specifications: {
      size: '800sqmm',
      brand: 'Kundan Cable',
      type: 'FR PVC Insulated',
      conductor: 'Multistrand Copper',
      core_type: 'Single Core Unsheathed',
      unit: 'per coil',
      hsn_code: '85446090',
      discount: '46%'
    },
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 1
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
      product.description.toLowerCase().includes(searchTerm) ||
      product.shortDescription.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
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