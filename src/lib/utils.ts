import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns an optimized image URL using Supabase Storage transformations.
 * For non-Supabase URLs, returns the original URL.
 * 
 * @param url - Original image URL
 * @param width - Desired width in pixels
 * @param height - Optional desired height in pixels
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(url: string, width: number, height?: number): string {
  if (!url) return url;

  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    let cleanUrl = url.split('?')[0];
    // Use render/image for Supabase transformations
    cleanUrl = cleanUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const params = [`width=${width}`, 'quality=80'];
    if (height) params.push(`height=${height}`, 'resize=cover');
    return `${cleanUrl}?${params.join('&')}`;
  }

  return url;
}
