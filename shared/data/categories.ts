// Electrical Product Categories - Professional Grade
import type { Category } from '@shared/types';

export const ELECTRICAL_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-1',
    name: 'Circuit Protection',
    slug: 'circuit-protection',
    description: 'Circuit breakers, fuses, surge protectors, and protective devices',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300',
  },
  {
    id: 'cat-2', 
    name: 'Wiring & Cables',
    slug: 'wiring-cables',
    description: 'Electrical cables, wires, conduits, and wiring accessories',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300',
  },
  {
    id: 'cat-3',
    name: 'Outlets & Switches',
    slug: 'outlets-switches', 
    description: 'GFCI outlets, smart switches, dimmers, and electrical accessories',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300',
  },
  {
    id: 'cat-4',
    name: 'Lighting Solutions',
    slug: 'lighting-solutions',
    description: 'LED fixtures, bulbs, commercial lighting, and controls',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=300',
  },
  {
    id: 'cat-5',
    name: 'Power Distribution',
    slug: 'power-distribution',
    description: 'Panels, transformers, meters, and distribution equipment',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300',
  },
  {
    id: 'cat-6',
    name: 'Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Professional electrical tools, meters, and testing equipment',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300',
  },
  {
    id: 'cat-7',
    name: 'Industrial Components',
    slug: 'industrial-components',
    description: 'Contactors, relays, motor controls, and industrial automation',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300',
  },
  {
    id: 'cat-8',
    name: 'Smart Home',
    slug: 'smart-home',
    description: 'IoT devices, smart switches, automated controls, and sensors',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300',
  }
];