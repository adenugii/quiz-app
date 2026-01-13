/**
 * Global State Management menggunakan Zustand.
 * Mengatur seluruh logika bisnis kuis: Timer, Skor, Navigasi Soal, dan Penyimpanan Sesi.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '@/types/quiz';
import { fetchQuizQuestions } from '@/services/quizApi';
import { QUIZ_CONFIG } from '@/lib/constants';

interface QuizState {
  // --- STATE VARIABLES (Data) ---
  username: string;
  questions: Question[];         // Menyimpan data soal dari API
  currentQuestionIndex: number;  // Pointer ke soal yang sedang aktif
  answers: Record<number, string>; // Map index soal -> jawaban user (O(1) lookup)
  timeLeft: number;              // Sisa waktu dalam detik
  isFinished: boolean;           // Status apakah kuis sudah selesai
  isLoading: boolean;            // Status loading saat fetch API
  error: string | null;          // Menyimpan pesan error jika fetch gagal

  // --- ACTIONS (Functions/Logic) ---
  startNewQuiz: (username: string) => Promise<void>;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  tickTimer: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  // Middleware Persist: Otomatis simpan state ke LocalStorage
  // Ini kunci utama fitur "RESUME KUIS"
  persist(
    (set, get) => ({
      // Initial State
      username: '',
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      timeLeft: QUIZ_CONFIG.TOTAL_TIME,
      isFinished: false,
      isLoading: false,
      error: null,

      /**
       * Memulai kuis baru:
       * 1. Set loading state
       * 2. Fetch data dari Service
       * 3. Reset semua state permainan (waktu, jawaban, index)
       */
      startNewQuiz: async (name) => {
        set({ isLoading: true, error: null });
        try {
          const questions = await fetchQuizQuestions(QUIZ_CONFIG.TOTAL_QUESTIONS);
          set({
            username: name,
            questions,
            currentQuestionIndex: 0,
            answers: {},
            timeLeft: QUIZ_CONFIG.TOTAL_TIME, // Reset waktu sesuai config
            isFinished: false,
            isLoading: false,
          });
        } catch (err) {
          set({ error: 'Gagal memuat soal. Coba lagi ya!', isLoading: false });
        }
      },

      /**
       * Menyimpan jawaban user untuk soal saat ini.
       * Menggunakan spread operator untuk update object answers secara immutable.
       */
      answerQuestion: (answer) => {
        const { currentQuestionIndex, answers } = get();
        set({
          answers: { ...answers, [currentQuestionIndex]: answer },
        });
      },

      /**
       * Navigasi ke soal berikutnya.
       * Jika sudah di soal terakhir, otomatis trigger finishQuiz().
       */
      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        } else {
          get().finishQuiz();
        }
      },

      /**
       * Logic Timer mundur.
       * Dipanggil setiap detik oleh `setInterval` di komponen UI.
       */
      tickTimer: () => {
        const { timeLeft, isFinished } = get();
        if (isFinished) return;
        
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        } else {
          get().finishQuiz(); // Waktu habis = Selesai
        }
      },

      finishQuiz: () => {
        set({ isFinished: true });
      },

      /**
       * Reset total.
       * Membersihkan state di memory DAN menghapus data di LocalStorage.
       * Penting agar user bisa mulai sesi baru yang bersih.
       */
      resetQuiz: () => {
        set({
          username: '',
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
          isFinished: false,
          timeLeft: QUIZ_CONFIG.TOTAL_TIME,
          error: null
        });
        localStorage.removeItem('quiz-storage'); 
      }
    }),
    {
      name: 'quiz-storage', // Key unik di LocalStorage browser
      storage: createJSONStorage(() => localStorage), // Explicit storage engine
    }
  )
);