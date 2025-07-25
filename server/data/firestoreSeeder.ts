// Professional Firestore Seeding System
// Seeds categories and products with professional electrical data and images

import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '@shared/firestore';
import { COLLECTIONS } from '../firestoreService';
import type { CreateCategory, CreateProduct } from '@shared/types';

// High-quality electrical product images from curated sources
const ELECTRICAL_PRODUCT_IMAGES = {
  circuit_breakers: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=800&fit=crop'
  ],
  outlets_switches: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572013577480-ad5f3b4b0cfe?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1527359443443-84a48c62c88b?w=800&h=800&fit=crop'
  ],
  lighting: [
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop'
  ],
  wiring: [
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581092335878-82e573d7e4f1?w=800&h=800&fit=crop'
  ],
  tools: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1609205264892-da6e93e5816e?w=800&h=800&fit=crop'
  ],
  panels: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=800&fit=crop'
  ]
};

// Professional electrical categories with detailed descriptions
const ELECTRICAL_CATEGORIES: CreateCategory[] = [
  {
    name: 'Circuit Protection',
    slug: 'circuit-protection',
    description: 'Professional circuit breakers, fuses, surge protectors, and electrical protection devices',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
  },
  {
    name: 'Outlets & Switches',
    slug: 'outlets-switches',
    description: 'GFCI outlets, smart switches, dimmers, and electrical accessories',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  },
  {
    name: 'Lighting Solutions',
    slug: 'lighting-solutions',
    description: 'LED fixtures, smart bulbs, commercial lighting, and lighting controls',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=400&fit=crop',
  },
  {
    name: 'Wiring & Cables',
    slug: 'wiring-cables',
    description: 'Electrical cables, wires, conduits, and wiring accessories',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
  {
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Professional electrical tools, meters, and testing equipment',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  },
  {
    name: 'Power Distribution',
    slug: 'power-distribution',
    description: 'Load centers, panels, transformers, and distribution equipment',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
  }
];

// Comprehensive electrical products with professional specifications
const ELECTRICAL_PRODUCTS: CreateProduct[] = [
  // Circuit Protection Products
  {
    name: 'Square D 20A Single Pole Circuit Breaker QO120',
    slug: 'square-d-20a-single-pole-breaker-qo120',
    description: 'Square D QO120 single pole 20 amp circuit breaker with 10,000 AIC interrupting capacity. UL Listed, compatible with Square D QO load centers. Features thermal magnetic operation and copper pigtail connections.',
    shortDescription: 'Square D QO120 20A single pole breaker with 10kA interrupting capacity',
    price: 1249,
    originalPrice: 1599,
    sku: 'SQD-QO120',
    stock: 45,
    categoryId: '', // Will be set after categories are created
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.circuit_breakers.slice(0, 2),
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
    name: 'Eaton 15A GFCI Circuit Breaker BR15GFCI',
    slug: 'eaton-15a-gfci-breaker-br15gfci',
    description: 'Eaton BR15GFCI 15 amp GFCI circuit breaker with self-test technology and LED status indicators. Protects against ground faults and provides Class A GFCI protection.',
    shortDescription: 'Eaton BR15GFCI with self-test technology and LED indicators',
    price: 3299,
    originalPrice: 3999,
    sku: 'ETN-BR15GFCI',
    stock: 28,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.circuit_breakers.slice(1, 3),
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
    name: 'Leviton SmartlockPro GFCI Outlet GFNT1-W',
    slug: 'leviton-smartlockpro-gfci-outlet-gfnt1-w',
    description: 'Leviton GFNT1-W SmartlockPro self-test GFCI outlet with 15A, 125V rating and LED indicator. Advanced self-testing technology eliminates monthly testing requirements.',
    shortDescription: 'Leviton self-test GFCI outlet with LED indicator',
    price: 1899,
    originalPrice: 2299,
    sku: 'LEV-GFNT1W',
    stock: 67,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.outlets_switches.slice(0, 2),
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
    name: 'Lutron Diva LED+ Dimmer Switch DVWCL-153PH',
    slug: 'lutron-diva-led-dimmer-switch-dvwcl-153ph',
    description: 'Lutron Diva LED+ dimmer switch compatible with dimmable LED and CFL bulbs. Features large paddle switch with slide dimmer and single pole/3-way operation.',
    shortDescription: 'Lutron Diva LED+ dimmer switch for LED and CFL bulbs',
    price: 2499,
    originalPrice: 2999,
    sku: 'LUT-DVWCL153PH',
    stock: 34,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.outlets_switches.slice(1, 3),
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
    name: 'Philips Hue White and Color Ambiance A19 Starter Kit',
    slug: 'philips-hue-white-color-ambiance-a19-starter-kit',
    description: 'Philips Hue White and Color Ambiance A19 LED smart bulb starter kit with bridge. 16 million colors, voice control compatible, and smartphone app control.',
    shortDescription: 'Philips Hue smart LED bulb starter kit with bridge',
    price: 9999,
    originalPrice: 12999,
    sku: 'PHI-HUE-A19-KIT',
    stock: 15,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.lighting.slice(0, 2),
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
    name: 'Commercial LED High Bay Light 150W UFO',
    slug: 'commercial-led-high-bay-light-150w-ufo',
    description: 'Commercial grade UFO LED high bay light with 150W power consumption and 21,000 lumens output. IP65 rated for industrial and warehouse applications.',
    shortDescription: 'Commercial 150W UFO LED high bay light - 21,000 lumens',
    price: 8499,
    originalPrice: 10999,
    sku: 'LED-HB-150W-UFO',
    stock: 22,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.lighting.slice(1, 3),
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
    name: 'Southwire 12-2 NM-B Cable with Ground 250ft',
    slug: 'southwire-12-2-nm-b-cable-ground-250ft',
    description: 'Southwire 12-2 NM-B (Romex) cable with ground wire, 250 feet. Solid copper conductors with PVC insulation, rated for 20A residential wiring applications.',
    shortDescription: 'Southwire 12-2 NM-B cable with ground - 250ft roll',
    price: 18999,
    originalPrice: 22999,
    sku: 'SW-12-2-NMB-250',
    stock: 12,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.wiring.slice(0, 2),
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
  {
    name: 'Klein Tools Electrical Wire Stripper 11055',
    slug: 'klein-tools-electrical-wire-stripper-11055',
    description: 'Klein Tools 11055 wire stripper/cutter for solid and stranded wire 10-18 AWG. Precision ground stripping holes and comfortable grip handles.',
    shortDescription: 'Klein Tools professional wire stripper for 10-18 AWG',
    price: 3299,
    originalPrice: 3999,
    sku: 'KT-11055',
    stock: 56,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.tools.slice(0, 2),
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

  // Tools & Equipment
  {
    name: 'Fluke 117 Electrician Multimeter',
    slug: 'fluke-117-electrician-multimeter',
    description: 'Fluke 117 True RMS digital multimeter designed for electricians. Non-contact voltage detection, AutoVolt automatic AC/DC voltage selection, and low input impedance.',
    shortDescription: 'Fluke 117 True RMS multimeter with non-contact voltage detection',
    price: 24999,
    originalPrice: 29999,
    sku: 'FLK-117',
    stock: 18,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.tools.slice(1, 3),
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
    name: 'Siemens 200A Main Panel Load Center P4080B1200CU',
    slug: 'siemens-200a-main-panel-load-center-p4080b1200cu',
    description: 'Siemens 40-space 80-circuit 200A main breaker panel load center. Indoor rated with copper bus bars, 22kA short circuit rating, and includes main breaker.',
    shortDescription: 'Siemens 40-space 200A main breaker load center',
    price: 24999,
    originalPrice: 29999,
    sku: 'SIE-P4080B1200CU',
    stock: 8,
    categoryId: '',
    imageUrls: ELECTRICAL_PRODUCT_IMAGES.panels.slice(0, 2),
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

export class FirestoreSeeder {
  static async seedCategories(): Promise<string[]> {
    console.log('🌱 Seeding categories to Firestore...');
    
    const batch = writeBatch(db);
    const categoryIds: string[] = [];

    ELECTRICAL_CATEGORIES.forEach((category, index) => {
      const docRef = doc(collection(db, COLLECTIONS.CATEGORIES));
      batch.set(docRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      categoryIds.push(docRef.id);
    });

    await batch.commit();
    console.log(`✅ Successfully seeded ${ELECTRICAL_CATEGORIES.length} categories`);
    return categoryIds;
  }

  static async seedProducts(categoryIds: string[]): Promise<void> {
    console.log('🌱 Seeding products to Firestore...');

    // Map category slugs to IDs
    const categoryMap: Record<string, string> = {
      'circuit-protection': categoryIds[0],
      'outlets-switches': categoryIds[1],
      'lighting-solutions': categoryIds[2],
      'wiring-cables': categoryIds[3],
      'tools-equipment': categoryIds[4],
      'power-distribution': categoryIds[5]
    };

    const batch = writeBatch(db);
    
    ELECTRICAL_PRODUCTS.forEach((product, index) => {
      const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
      
      // Assign category ID based on product type
      let categoryId = '';
      if (product.name.includes('Circuit Breaker') || product.name.includes('GFCI Circuit')) {
        categoryId = categoryMap['circuit-protection'];
      } else if (product.name.includes('Outlet') || product.name.includes('Switch') || product.name.includes('Dimmer')) {
        categoryId = categoryMap['outlets-switches'];
      } else if (product.name.includes('LED') || product.name.includes('Light') || product.name.includes('Hue')) {
        categoryId = categoryMap['lighting-solutions'];
      } else if (product.name.includes('Cable') || product.name.includes('Wire')) {
        categoryId = categoryMap['wiring-cables'];
      } else if (product.name.includes('Multimeter') || product.name.includes('Tools')) {
        categoryId = categoryMap['tools-equipment'];
      } else if (product.name.includes('Panel') || product.name.includes('Load Center')) {
        categoryId = categoryMap['power-distribution'];
      }

      batch.set(docRef, {
        ...product,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
    console.log(`✅ Successfully seeded ${ELECTRICAL_PRODUCTS.length} products`);
  }

  static async checkIfDataExists(): Promise<boolean> {
    const categoriesQuery = query(collection(db, COLLECTIONS.CATEGORIES), limit(1));
    const productsQuery = query(collection(db, COLLECTIONS.PRODUCTS), limit(1));
    
    const [categoriesSnapshot, productsSnapshot] = await Promise.all([
      getDocs(categoriesQuery),
      getDocs(productsQuery)
    ]);

    return !categoriesSnapshot.empty && !productsSnapshot.empty;
  }

  static async seedDatabase(): Promise<void> {
    try {
      console.log('🔍 Checking if data already exists...');
      const dataExists = await this.checkIfDataExists();
      
      if (dataExists) {
        console.log('📊 Database already contains data, skipping seeding');
        return;
      }

      console.log('🚀 Starting database seeding process...');
      
      // Seed categories first
      const categoryIds = await this.seedCategories();
      
      // Then seed products with category references
      await this.seedProducts(categoryIds);
      
      console.log('🎉 Database seeding completed successfully!');
      console.log(`📊 Added ${ELECTRICAL_CATEGORIES.length} categories and ${ELECTRICAL_PRODUCTS.length} products`);
      
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}