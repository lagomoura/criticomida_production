export interface Restaurant {
  id: number;
  /** Slug for `/restaurants/[id]`; must match a key in the page mocks. */
  slug: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  image: string;
  location: string;
  rating: number;
  description: string;
  reviewCount: number;
  category: string;
}

export const visitedRestaurants: Restaurant[] = [
  {
    id: 1,
    slug: 'don-asado',
    name: 'Don Asado',
    position: { lat: -34.6037, lng: -58.3816 },
    image: '/img/parrilla.jpg',
    location: 'San Nicolás, CABA',
    rating: 4.8,
    description: 'Parrilla argentina con cortes premium y ambiente familiar.',
    reviewCount: 12,
    category: 'parrillas',
  },
  {
    id: 2,
    slug: 'la-lupita',
    name: 'La Lupita',
    position: { lat: -34.598, lng: -58.42 },
    image: '/img/mexfood2.jpg',
    location: 'Villa Crespo, CABA',
    rating: 4.7,
    description: 'Tacos, burritos y margaritas en un ambiente colorido.',
    reviewCount: 11,
    category: 'mexico-food',
  },
  {
    id: 3,
    slug: 'brunch-co',
    name: 'Brunch & Co.',
    position: { lat: -34.59, lng: -58.39 },
    image: '/img/brunch.jpg',
    location: 'Recoleta, CABA',
    rating: 4.6,
    description: 'Brunch con opciones veganas y ambiente moderno.',
    reviewCount: 10,
    category: 'brunchs',
  },
  {
    id: 4,
    slug: 'sushi-house',
    name: 'Sushi House',
    position: { lat: -34.5628, lng: -58.4584 },
    image: '/img/japanfood.jpg',
    location: 'Belgrano, CABA',
    rating: 4.8,
    description: 'Sushi fresco y rolls creativos.',
    reviewCount: 14,
    category: 'japan-food',
  },
  {
    id: 5,
    slug: 'el-mariachi',
    name: 'El Mariachi',
    position: { lat: -34.58, lng: -58.43 },
    image: '/img/mexfood.jpg',
    location: 'Palermo, CABA',
    rating: 4.6,
    description: 'Comida mexicana tradicional y ambiente animado.',
    reviewCount: 9,
    category: 'mexico-food',
  },
  {
    id: 6,
    slug: 'bangkok-express',
    name: 'Bangkok Express',
    position: { lat: -34.6, lng: -58.4 },
    image: '/img/thaifood.jpg',
    location: 'Palermo, CABA',
    rating: 4.6,
    description: 'Pad thai, currys y street food tailandés.',
    reviewCount: 9,
    category: 'thaifood',
  },
];
