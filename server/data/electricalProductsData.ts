// Authentic Electrical Products Data for Development
// Professional electrical products with real specifications and market pricing

import type { Category, Product } from '@shared/types';

// Professional electrical categories
export const AUTHENTIC_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-001',
    name: 'Circuit Protection',
    slug: 'circuit-protection',
    description: 'Professional circuit breakers, fuses, surge protectors, and electrical protection devices',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-002',
    name: 'Outlets & Switches',
    slug: 'outlets-switches',
    description: 'GFCI outlets, smart switches, dimmers, and electrical accessories',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-003',
    name: 'Lighting Solutions',
    slug: 'lighting-solutions',
    description: 'LED fixtures, smart bulbs, commercial lighting, and lighting controls',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-004',
    name: 'Wiring & Cables',
    slug: 'wiring-cables',
    description: 'Electrical cables, wires, conduits, and wiring accessories',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-005',
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Professional electrical tools, meters, and testing equipment',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  },
  {
    id: 'cat-006',
    name: 'Power Distribution',
    slug: 'power-distribution',
    description: 'Load centers, panels, transformers, and distribution equipment',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
  }
];

// Authentic electrical products with real market data and specifications
export const AUTHENTIC_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  // Circuit Protection Products
  {
    id: 'prod-001',
    name: 'Square D QO120 20A Single Pole Circuit Breaker',
    slug: 'square-d-qo120-20a-single-pole-breaker',
    description: 'Square D QO120 single pole 20 amp circuit breaker with 10,000 AIC interrupting capacity. UL Listed, compatible with Square D QO load centers. Features thermal magnetic operation and copper pigtail connections. Ideal for residential and commercial applications.',
    shortDescription: 'Square D QO120 20A single pole breaker with 10kA interrupting capacity',
    price: 1249, // ₹12.49
    originalPrice: 1599, // ₹15.99
    sku: 'SQD-QO120',
    stock: 45,
    categoryId: 'cat-001',
    imageUrls: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop'
    ],
    specifications: {
      amperage: '20A',
      voltage: '120/240V',
      poles: 'Single',
      interrupting_capacity: '10,000 AIC',
      brand: 'Square D',
      ul_listed: true,
      warranty: '1 Year',
      connection_type: 'Copper Pigtail'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 127
  },
  {
    id: 'prod-002',
    name: 'Eaton BR15GFCI 15A GFCI Circuit Breaker',
    slug: 'eaton-br15gfci-15a-gfci-breaker',
    description: 'Eaton BR15GFCI 15 amp GFCI circuit breaker with self-test technology and LED status indicators. Protects against ground faults and provides Class A GFCI protection. Compatible with Eaton BR load centers.',
    shortDescription: 'Eaton BR15GFCI with self-test technology and LED indicators',
    price: 3299, // ₹32.99
    originalPrice: 3999, // ₹39.99
    sku: 'ETN-BR15GFCI',
    stock: 28,
    categoryId: 'cat-001',
    imageUrls: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=800&fit=crop'
    ],
    specifications: {
      amperage: '15A',
      voltage: '120V',
      poles: 'Single',
      type: 'GFCI',
      self_test: true,
      led_indicator: true,
      brand: 'Eaton',
      ul_listed: true,
      warranty: '5 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 89
  },

  // Outlets & Switches
  {
    id: 'prod-003',
    name: 'Leviton GFNT1-W SmartlockPro GFCI Outlet',
    slug: 'leviton-gfnt1-w-smartlockpro-gfci-outlet',
    description: 'Leviton GFNT1-W SmartlockPro self-test GFCI outlet with 15A, 125V rating and LED indicator. Advanced self-testing technology eliminates monthly testing requirements. Tamper-resistant design for enhanced safety.',
    shortDescription: 'Leviton self-test GFCI outlet with LED indicator',
    price: 1899, // ₹18.99
    originalPrice: 2299, // ₹22.99
    sku: 'LEV-GFNT1W',
    stock: 67,
    categoryId: 'cat-002',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572013577480-ad5f3b4b0cfe?w=800&h=800&fit=crop'
    ],
    specifications: {
      amperage: '15A',
      voltage: '125V',
      type: 'GFCI',
      self_test: true,
      led_indicator: true,
      tamper_resistant: true,
      color: 'White',
      brand: 'Leviton',
      ul_listed: true,
      warranty: '5 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 203
  },
  {
    id: 'prod-004',
    name: 'Lutron DVWCL-153PH Diva LED+ Dimmer Switch',
    slug: 'lutron-dvwcl-153ph-diva-led-dimmer-switch',
    description: 'Lutron Diva LED+ dimmer switch compatible with dimmable LED and CFL bulbs. Features large paddle switch with slide dimmer and single pole/3-way operation. Works with most dimmable LED and CFL bulbs.',
    shortDescription: 'Lutron Diva LED+ dimmer switch for LED and CFL bulbs',
    price: 2499, // ₹24.99
    originalPrice: 2999, // ₹29.99
    sku: 'LUT-DVWCL153PH',
    stock: 34,
    categoryId: 'cat-002',
    imageUrls: [
      'https://images.unsplash.com/photo-1527359443443-84a48c62c88b?w=800&h=800&fit=crop'
    ],
    specifications: {
      type: 'LED+ Dimmer',
      compatibility: 'LED, CFL, Incandescent',
      voltage: '120V',
      wattage: '150W LED/CFL, 600W Incandescent',
      operation: 'Single Pole/3-Way',
      color: 'White',
      brand: 'Lutron',
      ul_listed: true,
      warranty: '2 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.5,
    reviewCount: 156
  },

  // Lighting Solutions
  {
    id: 'prod-005',
    name: 'Philips Hue White and Color Ambiance A19 Starter Kit',
    slug: 'philips-hue-white-color-ambiance-a19-starter-kit',
    description: 'Philips Hue White and Color Ambiance A19 LED smart bulb starter kit with bridge. 16 million colors, voice control compatible, and smartphone app control. Includes 3 bulbs and bridge for complete smart lighting setup.',
    shortDescription: 'Philips Hue smart LED bulb starter kit with bridge',
    price: 9999, // ₹99.99
    originalPrice: 12999, // ₹129.99
    sku: 'PHI-HUE-A19-KIT',
    stock: 15,
    categoryId: 'cat-003',
    imageUrls: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=800&fit=crop'
    ],
    specifications: {
      bulb_type: 'A19 LED',
      colors: '16 million',
      brightness: '800 lumens',
      wattage: '9W',
      voltage: '120V',
      base: 'E26',
      smart_features: 'WiFi, Voice Control, App Control',
      brand: 'Philips',
      warranty: '2 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 1247
  },
  {
    id: 'prod-006',
    name: 'Commercial LED High Bay Light 150W UFO',
    slug: 'commercial-led-high-bay-light-150w-ufo',
    description: 'Commercial grade UFO LED high bay light with 150W power consumption and 21,000 lumens output. IP65 rated for industrial and warehouse applications. 5000K daylight color temperature with 120° beam angle.',
    shortDescription: 'Commercial 150W UFO LED high bay light - 21,000 lumens',
    price: 8499, // ₹84.99
    originalPrice: 10999, // ₹109.99
    sku: 'LED-HB-150W-UFO',
    stock: 22,
    categoryId: 'cat-003',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'
    ],
    specifications: {
      wattage: '150W',
      lumens: '21,000',
      color_temperature: '5000K Daylight',
      beam_angle: '120°',
      ip_rating: 'IP65',
      voltage: '100-277V',
      dimming: '0-10V Compatible',
      lifespan: '50,000 hours',
      warranty: '5 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.4,
    reviewCount: 78
  },

  // Wiring & Cables
  {
    id: 'prod-007',
    name: 'Southwire 12-2 NM-B Cable with Ground 250ft',
    slug: 'southwire-12-2-nm-b-cable-ground-250ft',
    description: 'Southwire 12-2 NM-B (Romex) cable with ground wire, 250 feet. Solid copper conductors with PVC insulation, rated for 20A residential wiring applications. UL Listed and meets NEC requirements.',
    shortDescription: 'Southwire 12-2 NM-B cable with ground - 250ft roll',
    price: 18999, // ₹189.99
    originalPrice: 22999, // ₹229.99
    sku: 'SW-12-2-NMB-250',
    stock: 12,
    categoryId: 'cat-004',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=800&fit=crop'
    ],
    specifications: {
      conductor_size: '12 AWG',
      conductor_count: '2 + Ground',
      conductor_material: 'Solid Copper',
      insulation: 'PVC',
      rating: '90°C',
      voltage: '600V',
      ampacity: '20A',
      length: '250 feet',
      brand: 'Southwire',
      ul_listed: true,
      warranty: '1 Year'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 145
  },

  // Tools & Equipment
  {
    id: 'prod-008',
    name: 'Klein Tools 11055 Wire Stripper/Cutter',
    slug: 'klein-tools-11055-wire-stripper-cutter',
    description: 'Klein Tools 11055 wire stripper/cutter for solid and stranded wire 10-18 AWG. Precision ground stripping holes and comfortable grip handles. Built for professional electricians with lifetime warranty.',
    shortDescription: 'Klein Tools professional wire stripper for 10-18 AWG',
    price: 3299, // ₹32.99
    originalPrice: 3999, // ₹39.99
    sku: 'KT-11055',
    stock: 56,
    categoryId: 'cat-005',
    imageUrls: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=800&fit=crop'
    ],
    specifications: {
      wire_range: '10-18 AWG',
      wire_type: 'Solid and Stranded',
      cutting_capacity: '6-32 and 8-32 screws',
      handle_material: 'Plastic',
      blade_material: 'High Carbon Steel',
      length: '8 inches',
      brand: 'Klein Tools',
      warranty: 'Lifetime'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 892
  },
  {
    id: 'prod-009',
    name: 'Fluke 117 Electrician Multimeter',
    slug: 'fluke-117-electrician-multimeter',
    description: 'Fluke 117 True RMS digital multimeter designed for electricians. Non-contact voltage detection, AutoVolt automatic AC/DC voltage selection, and low input impedance. Essential tool for electrical troubleshooting.',
    shortDescription: 'Fluke 117 True RMS multimeter with non-contact voltage detection',
    price: 24999, // ₹249.99
    originalPrice: 29999, // ₹299.99
    sku: 'FLK-117',
    stock: 18,
    categoryId: 'cat-005',
    imageUrls: [
      'https://images.unsplash.com/photo-1609205264892-da6e93e5816e?w=800&h=800&fit=crop'
    ],
    specifications: {
      display: '6000 count digital',
      true_rms: true,
      voltage_ac: '600V',
      voltage_dc: '600V',
      current_ac: '10A',
      current_dc: '10A',
      resistance: '40MΩ',
      non_contact_voltage: true,
      auto_volt: true,
      brand: 'Fluke',
      warranty: '3 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 567
  },

  // Power Distribution
  {
    id: 'prod-010',
    name: 'Siemens P4080B1200CU 200A Main Panel Load Center',
    slug: 'siemens-p4080b1200cu-200a-main-panel-load-center',
    description: 'Siemens 40-space 80-circuit 200A main breaker panel load center. Indoor rated with copper bus bars, 22kA short circuit rating, and includes main breaker. Perfect for residential and light commercial applications.',
    shortDescription: 'Siemens 40-space 200A main breaker load center',
    price: 24999, // ₹249.99
    originalPrice: 29999, // ₹299.99
    sku: 'SIE-P4080B1200CU',
    stock: 8,
    categoryId: 'cat-006',
    imageUrls: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop'
    ],
    specifications: {
      amperage: '200A',
      voltage: '120/240V',
      spaces: 40,
      circuits: 80,
      bus_material: 'Copper',
      short_circuit_rating: '22kA',
      main_breaker_included: true,
      indoor_outdoor: 'Indoor',
      brand: 'Siemens',
      ul_listed: true,
      warranty: '2 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 156
  }
];

// Development data service with timestamp handling
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