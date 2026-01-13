/**
 * Definisi kontrak data (Interface) yang sesuai dengan respon API OpenTDB.
 * Menjamin Type Safety di seluruh aplikasi.
 */

// Representasi satu objek soal dari API
export interface Question {
  category: string;
  type: "multiple" | "boolean";
  difficulty: string;
  question: string;       // Teks soal (seringkali mengandung HTML entities)
  correct_answer: string; // Kunci jawaban
  incorrect_answers: string[]; // Array jawaban pengecoh
}

// Struktur utama JSON response dari OpenTDB
export interface QuizApiResponse {
  response_code: number; // 0 = Success
  results: Question[];
}