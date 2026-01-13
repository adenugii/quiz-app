/**
 * File ini bertugas sebagai "Data Layer".
 * Berfungsi untuk berkomunikasi dengan API Eksternal (OpenTDB).
 * * KONSEP CLEAN ARCHITECTURE:
 * UI (Component) tidak boleh tahu detail fetch API.
 * UI hanya tahu: "Minta data soal", lalu terima hasilnya.
 */

import axios from 'axios';
import { QuizApiResponse, Question } from '@/types/quiz';

const BASE_URL = 'https://opentdb.com/api.php';

/**
 * Mengambil daftar soal kuis dari OpenTDB.
 * * @param amount - Jumlah soal yang ingin diambil (Default: 10)
 * @returns Promise berisi array Question
 */
export const fetchQuizQuestions = async (amount: number = 10): Promise<Question[]> => {
  try {
    // Menggunakan Generic Type <QuizApiResponse> agar return value terjamin sesuai interface
    const response = await axios.get<QuizApiResponse>(BASE_URL, {
      params: {
        amount,
        type: 'multiple', // Memaksa tipe soal Pilihan Ganda agar UI konsisten
      },
    });

    // Validasi sederhana bisa ditambahkan di sini jika API sering berubah format
    return response.data.results;
  } catch (error) {
    // Centralized Error Logging
    // Di real app, bisa diganti dengan Sentry atau logging service lain
    console.error("Gagal mengambil data kuis:", error);
    throw error; // Lempar error ke Store untuk ditangani (update state error)
  }
};