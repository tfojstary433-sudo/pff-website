import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { POSITION_MAPPING } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapPositionToPolish(pos: string): string {
  if (!pos || pos === '---') return '---';
  const p = pos.toUpperCase();
  return POSITION_MAPPING[p] || pos;
}

export async function fetchWithTimeout(resource: string | Request, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
