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
export function getOptimizedImageUrl(url: string, _width: number, _height?: number): string {
  if (!url) return url;
  
  // Return original URL without any compression or transformation
  // Strip any existing transformation query params if present
  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    let cleanUrl = url.split('?')[0];
    // Ensure we use /object/public/ (direct serving) not /render/image/
    cleanUrl = cleanUrl.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');
    return cleanUrl;
  }
  
  return url;
}
