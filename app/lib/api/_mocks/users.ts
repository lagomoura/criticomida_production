import type { CursorPage, PublicUserProfile, ReviewPost } from '@/app/lib/types/social';
import { mockGetAllPosts } from './feed';

const PROFILES: Record<string, PublicUserProfile> = {
  'user-mica': {
    id: 'user-mica',
    displayName: 'Mica Fernández',
    handle: 'micacomelona',
    bio: 'Crítica obsesiva del ramen y la pasta fresca. Palermo → todo.',
    location: 'Palermo, Buenos Aires',
    counts: { reviews: 47, followers: 842, following: 201 },
    viewerState: { isSelf: false, following: true },
  },
  'user-juli': {
    id: 'user-juli',
    displayName: 'Juli Mendes',
    handle: 'julipicacomida',
    bio: 'Busco milanesas honestas y pizzas de horno a leña.',
    counts: { reviews: 23, followers: 180, following: 95 },
    viewerState: { isSelf: false, following: false },
  },
  'user-caro': {
    id: 'user-caro',
    displayName: 'Carolina R.',
    handle: null,
    bio: null,
    counts: { reviews: 8, followers: 42, following: 120 },
    viewerState: { isSelf: false, following: false },
  },
  'user-tomi': {
    id: 'user-tomi',
    displayName: 'Tomás Echeverría',
    handle: 'tomiplatos',
    bio: 'Reseñas de pizza, parrilla y café. Sin filtros.',
    location: 'San Telmo',
    counts: { reviews: 61, followers: 1420, following: 180 },
    viewerState: { isSelf: false, following: true },
  },
  'user-ana': {
    id: 'user-ana',
    displayName: 'Ana Paula',
    handle: 'anapaulacome',
    bio: 'Dulces antes que salados. Pastelería fina ≥ repostería industrial.',
    counts: { reviews: 34, followers: 512, following: 74 },
    viewerState: { isSelf: false, following: false },
  },
  'user-dani': {
    id: 'user-dani',
    displayName: 'Daniel López',
    handle: 'danicome',
    bio: null,
    counts: { reviews: 12, followers: 68, following: 140 },
    viewerState: { isSelf: false, following: false },
  },
  'user-lucia': {
    id: 'user-lucia',
    displayName: 'Lucía Romero',
    handle: 'lucia_r',
    bio: 'Empanada de carne cortada a cuchillo o nada.',
    location: 'Villa Crespo',
    counts: { reviews: 19, followers: 234, following: 88 },
    viewerState: { isSelf: false, following: false },
  },
  'user-pedro': {
    id: 'user-pedro',
    displayName: 'Pedro Vila',
    handle: 'pedrocome',
    bio: 'Pruebo, reseño, olvido. Repetir.',
    counts: { reviews: 6, followers: 30, following: 50 },
    viewerState: { isSelf: false, following: false },
  },
  'user-sol': {
    id: 'user-sol',
    displayName: 'Sol Miranda',
    handle: 'solmir',
    bio: null,
    counts: { reviews: 5, followers: 22, following: 40 },
    viewerState: { isSelf: false, following: false },
  },
};

export function mockGetUserProfile(userId: string): PublicUserProfile {
  const known = PROFILES[userId];
  if (known) return known;
  return {
    id: userId,
    displayName: 'Usuario',
    handle: null,
    bio: null,
    counts: { reviews: 0, followers: 0, following: 0 },
    viewerState: { isSelf: false, following: false },
  };
}

export function mockGetUserPosts(userId: string): CursorPage<ReviewPost> {
  return {
    items: mockGetAllPosts().filter((p) => p.author.id === userId),
    nextCursor: null,
  };
}
