export interface Restaurant {
  id: number;
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
    name: 'Trattoria del Ponte',
    position: { lat: 45.4642, lng: 9.1900 },
    image: '/img/cart1.jpg',
    location: 'Milan, Italy',
    rating: 4.5,
    description: 'A cozy italian trattoria with a view of the bridge.',
    reviewCount: 150,
    category: 'parrillas',
  },
  {
    id: 2,
    name: 'El Rincón de Juan',
    position: { lat: 36.7213, lng: -4.4214 },
    image: '/img/cart2.jpg',
    location: 'Málaga, Spain',
    rating: 4.2,
    description: 'Authentic spanish tapas and wine.',
    reviewCount: 88,
    category: 'mexico-food',
  },
  {
    id: 3,
    name: 'Le Procope',
    position: { lat: 48.8530, lng: 2.3386 },
    image: '/img/about.jpg',
    location: 'Paris, France',
    rating: 4.8,
    description: 'The oldest café in Paris, serving classic French cuisine.',
    reviewCount: 320,
    category: 'brunchs',
  },
  {
    id: 4,
    name: 'Sukiyabashi Jiro',
    position: { lat: 35.6696, lng: 139.7672 },
    image: '/img/japanfood.jpg',
    location: 'Tokyo, Japan',
    rating: 4.9,
    description: 'World-renowned sushi restaurant.',
    reviewCount: 450,
    category: 'japan-food',
  },
  {
    id: 5,
    name: 'Pujol',
    position: { lat: 19.4326, lng: -99.1332 },
    image: '/img/mexfood.jpg',
    location: 'Mexico City, Mexico',
    rating: 4.7,
    description: 'Modern Mexican cuisine in a stylish setting.',
    reviewCount: 250,
    category: 'mexico-food',
  },
  {
    id: 6,
    name: 'Gaggan Anand',
    position: { lat: 13.7563, lng: 100.5018 },
    image: '/img/thaifood.jpg',
    location: 'Bangkok, Thailand',
    rating: 4.8,
    description: 'Progressive Indian cuisine in the heart of Bangkok.',
    reviewCount: 190,
    category: 'thaifood',
  },
];

