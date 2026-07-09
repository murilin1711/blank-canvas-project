import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string, width: number, _height?: number, quality = 85): string {
  if (!url) return url;

  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    const base = url.split('?')[0]
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${base}?width=${width}&quality=${quality}&resize=contain`;
  }

  return url;
}
