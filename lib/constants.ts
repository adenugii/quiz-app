/**
 * File ini berfungsi sebagai "Single Source of Truth" untuk konfigurasi aplikasi.
 *
 * MENGAPA INI PENTING?
 * Menghindari "Magic Numbers" (angka hardcoded) yang tersebar di berbagai file.
 * Jika aturan kuis berubah, kita cukup update di sini tanpa mencari file satu per satu.
 */

export const QUIZ_CONFIG = {
  // Jumlah soal yang akan di-fetch dari OpenTDB API
  // Digunakan di: store/useQuizStore.ts (saat fetch) & login page (info badge)
  TOTAL_QUESTIONS: 10,

  // Durasi pengerjaan kuis dalam satuan detik
  // Digunakan di: store/useQuizStore.ts (initial state) & result page (kalkulasi)
  TOTAL_TIME: 60,

  // Nilai minimum untuk dianggap "Lulus" (Green Theme) vs "Gagal" (Orange Theme)
  // Digunakan di: result page (untuk menentukan warna UI & pesan motivasi)
  PASSING_SCORE: 70,
};