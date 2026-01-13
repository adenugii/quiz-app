import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn
 * @description
 * Helper function untuk menggabungkan class Tailwind secara dinamis dan aman.
 *
 * CARA KERJA:
 * 1. clsx: Menangani logic kondisional.
 * Contoh: clsx("bg-red-500", isOpen && "block") -> Jika isOpen true, hasilnya "bg-red-500 block".
 *
 * 2. twMerge: Menangani konflik style Tailwind.
 * Contoh: twMerge("px-4 px-8") -> Hasilnya "px-8" (yang terakhir menang).
 * Tanpa twMerge, CSS cascading browser bisa membuat hasilnya tidak terprediksi.
 *
 * @param inputs - Daftar class atau kondisi class
 * @returns String class yang sudah digabung dan dibersihkan dari konflik
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}