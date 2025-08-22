// Electrical Product Categories - Professional Grade
import type { Category } from '@shared/types';

export const ELECTRICAL_CATEGORIES: Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-1',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'Flame retardant PVC insulated cables, copper conductors, industrial wiring solutions',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300',
  },
  {
    id: 'cat-2',
    name: 'LED Emergency Bulb',
    slug: 'led-emergency-bulb',
    description: 'Emergency LED bulbs with backup power, inverter bulbs for power outages',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=300',
  },
  {
    id: 'cat-3',
    name: 'LED Flood Light',
    slug: 'led-flood-light',
    description: 'High-performance LED flood lights, IP66 rated, commercial and industrial lighting',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300',
  },
  {
    id: 'cat-4',
    name: 'LED Street Light',
    slug: 'led-street-light',
    description: 'Energy-efficient LED street lights, IP66 protection, urban and highway lighting',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300',
  }
];