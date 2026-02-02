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
  
  // Check if it's a Supabase Storage URL
  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    const params = [`width=${width}`];
    if (height) params.push(`height=${height}`);
    params.push('resize=contain');
    return `${url}${separator}${params.join('&')}`;
  }
  
  return url;
}
