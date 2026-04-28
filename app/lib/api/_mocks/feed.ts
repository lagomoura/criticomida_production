import type { CursorPage, FeedType, ReviewPost } from '@/app/lib/types/social';

const BASE_TIME = new Date('2026-04-22T14:30:00-03:00').getTime();
const ago = (seconds: number) => new Date(BASE_TIME - seconds * 1000).toISOString();

const POSTS_FOR_YOU: ReviewPost[] = [
  {
    id: 'rev-001',
    createdAt: ago(60 * 8),
    author: {
      id: 'user-mica',
      displayName: 'Mica Fernández',
      handle: 'micacomelona',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-001',
      name: 'Ramen tantanmen',
      restaurantId: 'juajua-ramen',
      restaurantName: 'JuaJua Ramen',
      category: 'Japonesa',
    },
    score: 4.7,
    text: 'El caldo está a otro nivel. Picante justo, espesor de los que dejan nube de especias en la cuchara. Los fideos con buen punto, las lonchas de chashu finas pero generosas. Lo pediría de nuevo sin pensarlo.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=70',
        alt: 'Ramen tantanmen',
      },
    ],
    stats: { likes: 42, comments: 6, saves: 18 },
    viewerState: { liked: false, saved: true, followingAuthor: true },
  },
  {
    id: 'rev-002',
    createdAt: ago(60 * 45),
    author: {
      id: 'user-juli',
      displayName: 'Juli Mendes',
      handle: 'julipicacomida',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-002',
      name: 'Milanesa napolitana XL',
      restaurantId: 'pertutti',
      restaurantName: 'Pertutti',
      category: 'Argentina',
    },
    score: 4.1,
    text: 'La mila es honesta: fina, crocante, bien salada. La salsa napolitana podría ser más ácida, pero el queso funde como corresponde. Porción para compartir entre dos sin esfuerzo.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=1200&q=70',
        alt: 'Milanesa',
      },
      {
        url: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=70',
        alt: 'Papas fritas',
      },
    ],
    stats: { likes: 18, comments: 2, saves: 4 },
    viewerState: { liked: true, saved: false, followingAuthor: false },
  },
  {
    id: 'rev-003',
    createdAt: ago(60 * 60 * 3),
    author: {
      id: 'user-caro',
      displayName: 'Carolina R.',
      handle: null,
      avatarUrl: null,
    },
    dish: {
      id: 'dish-003',
      name: 'Tacos al pastor',
      restaurantId: 'che-taco-comida-mexicana',
      restaurantName: 'Che Taco Comida Mexicana',
      category: 'Mexicana',
    },
    score: 3.6,
    text: 'Ok. La carne bien condimentada, ananá suficiente. Tortilla un poco blanda, no raspada. Salsa verde decente, la roja picaba por el lado flojo.',
    stats: { likes: 9, comments: 1, saves: 1 },
    viewerState: { liked: false, saved: false },
  },
  {
    id: 'rev-004',
    createdAt: ago(60 * 60 * 9),
    author: {
      id: 'user-tomi',
      displayName: 'Tomás Echeverría',
      handle: 'tomiplatos',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-004',
      name: 'Pizza de muzzarella',
      restaurantId: 'pizzeria-cristobal',
      restaurantName: 'Pizzeria Cristobal',
      category: 'Pizza',
    },
    score: 4.8,
    text: 'La pizza de muzza porteña de referencia. Masa gruesa esponjosa por dentro, base crocante, muzza que tira medio metro. No es sutil, no pretende serlo. Es lo que es y lo hace mejor que nadie.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=70',
        alt: 'Pizza de muzzarella',
      },
      {
        url: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=1200&q=70',
        alt: 'Interior del local',
      },
      {
        url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=70',
        alt: 'Faina',
      },
      {
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=70',
        alt: 'Plato servido',
      },
    ],
    stats: { likes: 128, comments: 24, saves: 56 },
    viewerState: { liked: true, saved: true, followingAuthor: true },
  },
  {
    id: 'rev-005',
    createdAt: ago(60 * 60 * 26),
    author: {
      id: 'user-ana',
      displayName: 'Ana Paula',
      handle: 'anapaulacome',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-005',
      name: 'Cheesecake de frutos rojos',
      restaurantId: 'bao-kitchen',
      restaurantName: 'Bao Kitchen',
      category: 'Dulces',
    },
    score: 4.4,
    text: 'Cheesecake al punto justo: queso crema dominante, no empalagoso, base de galleta con manteca real (no margarina rara). El coulis de frutos rojos con acidez suficiente para equilibrar. Lo único en contra: porción pequeña para el precio.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=1200&q=70',
        alt: 'Cheesecake',
      },
    ],
    stats: { likes: 31, comments: 4, saves: 12 },
    viewerState: { liked: false, saved: false },
  },
  {
    id: 'rev-006',
    createdAt: ago(60 * 60 * 50),
    author: {
      id: 'user-dani',
      displayName: 'Daniel López',
      handle: 'danicome',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-006',
      name: 'Bowl poke salmón',
      restaurantId: 'hana-poke-bar',
      restaurantName: 'HANA Poke & Bar',
      category: 'Saludable',
    },
    score: 3.3,
    text: 'Correcto, nada más. Salmón fresco pero escaso, arroz algo seco. Aderezo genérico. Cumple si tenés hambre y no querés pensar.',
    stats: { likes: 4, comments: 0, saves: 0 },
    viewerState: { liked: false, saved: false },
  },
  {
    id: 'rev-007',
    createdAt: ago(60 * 60 * 72),
    author: {
      id: 'user-lucia',
      displayName: 'Lucía Romero',
      handle: 'lucia_r',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-007',
      name: 'Empanadas de carne cortada a cuchillo',
      restaurantId: 'mocozi-k-bbq',
      restaurantName: 'Mocozi K- BBQ',
      category: 'Argentina',
    },
    score: 4.6,
    text: 'Masa fina, dorada pareja. Carne cortada a cuchillo con el nivel justo de jugo — ni secas ni chorreando. Cebolla rehogada, pimentón presente. La aceituna en su lugar. Tradicional, sin fuegos artificiales.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1593085260707-5377ba37f868?w=1200&q=70',
        alt: 'Empanadas de carne',
      },
    ],
    stats: { likes: 67, comments: 11, saves: 22 },
    viewerState: { liked: true, saved: true },
  },
  {
    id: 'rev-008',
    createdAt: ago(60 * 60 * 18),
    author: {
      id: 'user-pedro',
      displayName: 'Pedro Vila',
      handle: 'pedrocome',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-001',
      name: 'Ramen tantanmen',
      restaurantId: 'juajua-ramen',
      restaurantName: 'JuaJua Ramen',
      category: 'Japonesa',
    },
    score: 4.3,
    text: 'Buen caldo, punto justo de picante. No lo amé tanto como esperaba por las reviews, pero claramente de los mejores ramens del barrio. La porción cumple sin excederse.',
    stats: { likes: 12, comments: 2, saves: 3 },
    viewerState: { liked: false, saved: false },
  },
  {
    id: 'rev-009',
    createdAt: ago(60 * 60 * 36),
    author: {
      id: 'user-sol',
      displayName: 'Sol Miranda',
      handle: 'solmir',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-004',
      name: 'Pizza de muzzarella',
      restaurantId: 'pizzeria-cristobal',
      restaurantName: 'Pizzeria Cristobal',
      category: 'Pizza',
    },
    score: 4.6,
    text: 'Güerrin es Güerrin. Si no pisaste el local, no se puede hablar de pizza porteña con autoridad. La fugazzeta también vale la visita.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1548365328-9f547fb09530?w=1200&q=70',
        alt: 'Pizza porteña',
      },
    ],
    stats: { likes: 45, comments: 7, saves: 15 },
    viewerState: { liked: false, saved: false },
  },
  {
    id: 'rev-010',
    createdAt: ago(60 * 60 * 96),
    author: {
      id: 'user-mica',
      displayName: 'Mica Fernández',
      handle: 'micacomelona',
      avatarUrl: null,
    },
    dish: {
      id: 'dish-008',
      name: 'Gyoza de cerdo',
      restaurantId: 'juajua-ramen',
      restaurantName: 'JuaJua Ramen',
      category: 'Japonesa',
    },
    score: 4.4,
    text: 'La masa bien fina, el relleno jugoso, la base crocanteada al punto. Seis piezas, ideal para compartir con el ramen. El dip de chili oil de la casa le suma.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&q=70',
        alt: 'Gyoza',
      },
    ],
    stats: { likes: 22, comments: 1, saves: 8 },
    viewerState: { liked: true, saved: false, followingAuthor: true },
  },
];

/**
 * Mutable store of posts created via the compose flow during the dev session.
 * Newest first so they appear on top of the feed.
 */
const USER_POSTS: ReviewPost[] = [];

export function mockFeed({ type, cursor }: { type: FeedType; cursor?: string | null }): CursorPage<ReviewPost> {
  // Ignore cursor — single page mock (v1).
  void cursor;
  if (type === 'following') {
    return { items: [], nextCursor: null };
  }
  return { items: [...USER_POSTS, ...POSTS_FOR_YOU], nextCursor: null };
}

export function mockAddUserPost(post: ReviewPost): void {
  USER_POSTS.unshift(post);
}

export function mockGetAllPosts(): ReviewPost[] {
  return [...USER_POSTS, ...POSTS_FOR_YOU];
}
