// Comprehensive Electrical Products Database - Amazon-style
import type { Product } from '@shared/types';

export const ELECTRICAL_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  // Circuit Protection Category
  {
    id: 'prod-001',
    name: 'Square D 20A Single Pole Circuit Breaker',
    slug: 'square-d-20a-single-pole-breaker',
    description: 'Square D QO120 single pole 20 amp circuit breaker. UL Listed, 10,000 AIC interrupting capacity. Compatible with Square D QO load centers.',
    shortDescription: 'Square D QO120 20A single pole breaker with 10kA interrupting capacity',
    price: 1249,
    originalPrice: 1599,
    sku: 'SQD-QO120',
    stock: 45,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=600'
    ],
    specifications: {
      amperage: '20A',
      voltage: '120/240V',
      poles: 'Single',
      interrupting_capacity: '10,000 AIC',
      brand: 'Square D',
      ul_listed: true,
      warranty: '1 Year'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 127
  },
  {
    id: 'prod-002', 
    name: 'Eaton 15A GFCI Circuit Breaker',
    slug: 'eaton-15a-gfci-breaker',
    description: 'Eaton BR15GFCI 15 amp GFCI circuit breaker. Self-test technology, LED status indicators. Protects against ground faults and arc faults.',
    shortDescription: 'Eaton BR15GFCI with self-test technology and LED indicators',
    price: 3299,
    originalPrice: 3999,
    sku: 'ETN-BR15GFCI',
    stock: 28,
    categoryId: 'cat-1',
    imageUrls: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600'
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
  {
    id: 'prod-003',
    name: 'Siemens 200A Main Panel Load Center',
    slug: 'siemens-200a-main-panel',
    description: 'Siemens 40-space 80-circuit 200A main breaker panel. Indoor rated, copper bus bars, 22kA short circuit rating. Includes main breaker.',
    shortDescription: 'Siemens 40-space 200A main breaker load center',
    price: 24999,
    originalPrice: 29999,
    sku: 'SIE-P4080B1200CU',
    stock: 8,
    categoryId: 'cat-5',
    imageUrls: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=600'
    ],
    specifications: {
      amperage: '200A',
      voltage: '120/240V',
      spaces: 40,
      circuits: 80,
      bus_material: 'Copper',
      short_circuit_rating: '22kA',
      main_breaker_included: true,
      brand: 'Siemens',
      ul_listed: true,
      warranty: '2 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 156
  },

  // Outlets & Switches Category
  {
    id: 'prod-004',
    name: 'Leviton SmartlockPro GFCI Outlet',
    slug: 'leviton-smartlockpro-gfci-outlet',
    description: 'Leviton GFNT1-W SmartlockPro self-test GFCI outlet. 15A, 125V with LED indicator. Advanced self-testing technology eliminates monthly testing.',
    shortDescription: 'Leviton self-test GFCI outlet with LED indicator',
    price: 1899,
    originalPrice: 2299,
    sku: 'LEV-GFNT1W',
    stock: 67,
    categoryId: 'cat-3',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600'
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
    id: 'prod-005',
    name: 'Lutron Caseta Smart Dimmer Switch',
    slug: 'lutron-caseta-smart-dimmer',
    description: 'Lutron PD-6WCL-WH Caseta wireless smart dimmer switch. Works with Alexa, Google Assistant, HomeKit. No neutral wire required.',
    shortDescription: 'Lutron Caseta wireless smart dimmer with voice control',
    price: 4199,
    originalPrice: 4999,
    sku: 'LUT-PD6WCLWH',
    stock: 34,
    categoryId: 'cat-8',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600'
    ],
    specifications: {
      load_type: 'LED/CFL/Incandescent',
      wattage: '600W',
      wireless: 'Clear Connect RF',
      neutral_required: false,
      voice_control: 'Alexa, Google, HomeKit',
      color: 'White',
      brand: 'Lutron',
      ul_listed: true,
      warranty: '3 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.5,
    reviewCount: 412
  },

  // Wiring & Cables Category  
  {
    id: 'prod-006',
    name: 'Southwire 12 AWG THHN Solid Copper Wire',
    slug: 'southwire-12awg-thhn-copper-wire',
    description: 'Southwire 500ft 12 AWG THHN solid copper building wire. 600V rated, heat and moisture resistant. Perfect for residential and commercial wiring.',
    shortDescription: 'Southwire 500ft 12 AWG THHN solid copper wire',
    price: 8999,
    originalPrice: 10999,
    sku: 'SW-12THHN500',
    stock: 22,
    categoryId: 'cat-2',
    imageUrls: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600'
    ],
    specifications: {
      gauge: '12 AWG',
      type: 'THHN',
      conductor: 'Solid Copper',
      length: '500 ft',
      voltage: '600V',
      temperature: '90°C',
      insulation: 'PVC',
      brand: 'Southwire',
      ul_listed: true,
      warranty: '25 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 78
  },
  {
    id: 'prod-007',
    name: 'Klein Tools Wire Strippers Multi-Tool',
    slug: 'klein-wire-strippers-multi-tool',
    description: 'Klein Tools 11061 wire strippers and crimpers. Strips 10-18 AWG solid and 12-20 AWG stranded wire. Crimps insulated and non-insulated terminals.',
    shortDescription: 'Klein Tools wire strippers for 10-20 AWG wire',
    price: 2899,
    originalPrice: 3499,
    sku: 'KLN-11061',
    stock: 89,
    categoryId: 'cat-6',
    imageUrls: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600'
    ],
    specifications: {
      wire_range_solid: '10-18 AWG',
      wire_range_stranded: '12-20 AWG',
      crimping: 'Insulated/Non-insulated terminals',
      length: '8.25 inches',
      handles: 'Journeyman comfort grips',
      brand: 'Klein Tools',
      made_in: 'USA',
      warranty: 'Lifetime'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 334
  },

  // Lighting Solutions Category
  {
    id: 'prod-008',
    name: 'Philips 4ft LED Shop Light',
    slug: 'philips-4ft-led-shop-light',
    description: 'Philips 40W 4ft LED shop light fixture. 4000 lumens, 5000K daylight, linkable design. Energy efficient replacement for fluorescent fixtures.',
    shortDescription: 'Philips 40W LED shop light with 4000 lumens output',
    price: 4599,
    originalPrice: 5999,
    sku: 'PHI-4FTLED40W',
    stock: 56,
    categoryId: 'cat-4',
    imageUrls: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=600'
    ],
    specifications: {
      wattage: '40W',
      lumens: '4000',
      color_temperature: '5000K Daylight',
      length: '48 inches',
      linkable: true,
      mounting: 'Chain/Surface',
      lifespan: '50,000 hours',
      brand: 'Philips',
      ul_listed: true,
      warranty: '5 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 167
  },
  {
    id: 'prod-009',
    name: 'Cooper Emergency Exit Light',
    slug: 'cooper-emergency-exit-light',
    description: 'Cooper Lighting APX6R LED emergency exit sign. Red letters, battery backup, self-testing. Meets all code requirements for commercial buildings.',
    shortDescription: 'Cooper LED emergency exit sign with battery backup',
    price: 7899,
    originalPrice: 9499,
    sku: 'COO-APX6R',
    stock: 31,
    categoryId: 'cat-4',
    imageUrls: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=600'
    ],
    specifications: {
      type: 'Emergency Exit Sign',
      led_type: 'High efficiency LED',
      color: 'Red',
      battery_backup: '90 minutes',
      self_testing: true,
      mounting: 'Wall/Ceiling',
      brand: 'Cooper Lighting',
      ul_listed: true,
      warranty: '5 Years'
    },
    isFeatured: false,
    isActive: true,
    rating: 4.4,
    reviewCount: 92
  },

  // Tools & Equipment Category
  {
    id: 'prod-010',
    name: 'Fluke 117 Digital Multimeter',
    slug: 'fluke-117-digital-multimeter',
    description: 'Fluke 117 True RMS digital multimeter. Non-contact voltage detection, low input impedance, AutoVolt automatic AC/DC voltage selection.',
    shortDescription: 'Fluke 117 True RMS multimeter with non-contact voltage detection',
    price: 17999,
    originalPrice: 21999,
    sku: 'FLK-117',
    stock: 18,
    categoryId: 'cat-6',
    imageUrls: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600'
    ],
    specifications: {
      display: '6000 count',
      accuracy: '±0.5%',
      voltage_range: '600V AC/DC',
      current_range: '10A',
      resistance: '40MΩ',
      features: 'True RMS, Non-contact voltage',
      safety_rating: 'CAT III 600V',
      brand: 'Fluke',
      warranty: '3 Years'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 456
  },

  // Industrial Components Category
  {
    id: 'prod-011',
    name: 'Allen-Bradley Motor Starter',
    slug: 'allen-bradley-motor-starter',
    description: 'Allen-Bradley 509-COD-A2D motor starter. Size 1, 27A, 3-phase. NEMA rated with overload protection. Suitable for pumps, fans, and conveyors.',
    shortDescription: 'Allen-Bradley Size 1 motor starter with overload protection',
    price: 32999,
    originalPrice: 38999,
    sku: 'AB-509CODA2D',
    stock: 12,
    categoryId: 'cat-7',
    imageUrls: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=600'
    ],
    specifications: {
      size: 'NEMA Size 1',
      amperage: '27A',
      phases: '3-Phase',
      voltage: '480V',
      overload_protection: 'Thermal',
      enclosure: 'Open',
      brand: 'Allen-Bradley',
      ul_listed: true,
      warranty: '1 Year'
    },
    isFeatured: false,
    isActive: true,  
    rating: 4.7,
    reviewCount: 63
  },

  // Smart Home Category
  {
    id: 'prod-012',
    name: 'Ring Smart Doorbell Pro',
    slug: 'ring-smart-doorbell-pro',
    description: 'Ring Video Doorbell Pro with 1080HD video, advanced motion detection, and customizable privacy settings. Works with existing doorbell wiring.',
    shortDescription: 'Ring Doorbell Pro with 1080HD video and motion detection',
    price: 12999,
    originalPrice: 16999,
    sku: 'RNG-DBPRO',
    stock: 43,
    categoryId: 'cat-8',
    imageUrls: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600'
    ],
    specifications: {
      video_quality: '1080p HD',
      field_of_view: '160° horizontal, 90° vertical',
      night_vision: 'Infrared LED',
      motion_detection: 'Advanced PIR',
      connectivity: '2.4GHz/5GHz WiFi',
      power: 'Hardwired',
      brand: 'Ring',
      warranty: '1 Year'
    },
    isFeatured: true,
    isActive: true,
    rating: 4.3,
    reviewCount: 1247
  }
];