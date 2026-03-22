export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  // Legacy compatibility aliases
  category?: string;
  img?: string;
  alt?: string;
  title?: string;
  label?: string;
  reviewCount?: number;
}
