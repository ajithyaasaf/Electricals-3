// Electrical Product Categories - Professional Grade
import type { Category } from '@shared/types';

export const ELECTRICAL_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-1',
    name: 'Wires and Cables',
    slug: 'wires-cables',
    description: 'Flame retardant PVC insulated cables, copper conductors, industrial wiring solutions',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300',
  },
  {
    id: 'cat-2',
    name: 'Switch and Sockets',
    slug: 'switch-sockets',
    description: 'Modular switches, electrical sockets, plug points, and switching solutions',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300',
  },
  {
    id: 'cat-3',
    name: 'Electric Accessories',
    slug: 'electric-accessories',
    description: 'Extension cords, plug adapters, electrical connectors, and accessories',
    imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300',
  },
  {
    id: 'cat-4',
    name: 'Electrical Pipes and Fittings',
    slug: 'electrical-pipes-fittings',
    description: 'PVC conduits, electrical pipes, junction boxes, and cable management fittings',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300',
  },
  {
    id: 'cat-5',
    name: 'Distribution Box',
    slug: 'distribution-box',
    description: 'MCB boxes, distribution boards, consumer units, and electrical panels',
    imageUrl: 'https://images.unsplash.com/photo-1621905252472-178d3c559ec3?w=400&h=300',
  },
  {
    id: 'cat-6',
    name: 'Led Bulb and Fittings',
    slug: 'led-bulb-fittings',
    description: 'LED bulbs, emergency lights, flood lights, street lights, and LED fittings',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=300',
  }
];