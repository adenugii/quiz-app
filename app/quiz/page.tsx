"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { Timer, CheckCircle2, Circle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizPage() {
  const router = useRouter();
  
  // Mengambil state dan actions dari Zustand Store
  const {
    questions,
    currentQuestionIndex,
    username,
    timeLeft,
    answerQuestion,
    nextQuestion,
    tickTimer,
    isFinished,
  } = useQuizStore();

  // State lokal untuk visual feedback jawaban yang dipilih
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 1. ROUTE PROTECTION
  // Mencegah user mengakses halaman ini langsung via URL tanpa login/data soal.
  // Jika nama kosong atau soal kosong, tendang balik ke home.
  useEffect(() => {
    if (!username || questions.length === 0) {
      router.replace("/");
    }
  }, [username, questions, router]);

  // 2. TIMER LOGIC (SPA Friendly)
  // Timer berjalan di client-side menggunakan setInterval.
  // PENTING: Timer ini tidak akan reset saat ganti soal karena ini SPA (Single Page Application).
  useEffect(() => {
    if (isFinished) {
      router.replace("/result"); // Redirect otomatis jika waktu habis/selesai
      return;
    }
    const timer = setInterval(() => tickTimer(), 1000);
    
    // Cleanup function: Hentikan interval saat component unmount (mencegah memory leak)
    return () => clearInterval(timer);
  }, [tickTimer, isFinished, router]);

  // 3. ANSWER HANDLING LOGIC
  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Mencegah double click / spamming tombol
    
    setSelectedAnswer(answer); // Set state lokal untuk efek warna tombol
    answerQuestion(answer);    // Simpan jawaban ke Global Store (Persist)

    // Beri jeda 0.6 detik agar user sempat melihat jawaban yang dipilih
    // sebelum otomatis pindah ke soal berikutnya.
    setTimeout(() => {
      nextQuestion();
      setSelectedAnswer(null); // Reset state lokal untuk soal baru
    }, 600);
  };

  // Helper untuk mengambil data soal saat ini
  const currentQ = questions[currentQuestionIndex];
  
  // 4. MEMOIZATION (Performance Optimization)
  // Menggunakan useMemo agar urutan jawaban (shuffle) TIDAK berubah saat timer berjalan.
  // Jika tidak di-memo, setiap detik (saat timeLeft berubah), component re-render 
  // dan jawaban akan teracak ulang terus menerus.
  const allAnswers = useMemo(() => {
    if (!currentQ) return [];
    // Gabungkan jawaban salah + benar, lalu acak posisinya
    return [...currentQ.incorrect_answers, currentQ.correct_answer].sort(() => Math.random() - 0.5);
  }, [currentQ]);

  // Menghitung persentase progress bar
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Render safety check
  if (!currentQ) return null;

  return (
    <main className="relative min-h-screen w-full bg-slate-50 overflow-hidden text-slate-800 font-sans">
      
      {/* Background elements... */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* --- TOP BAR (Fixed Header) --- */}
      <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-slate-900/90 border-b border-white/5 px-6 py-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-slate-800">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Player</p>
              <p className="text-sm font-bold text-white tracking-tight">{username}</p>
            </div>
          </div>

          {/* Timer Badge (Visual Indikator waktu menipis) */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold transition-all border ${
            timeLeft <= 10 
              ? "bg-red-900/20 text-red-400 border-red-500/30 animate-pulse" 
              : "bg-slate-800 text-slate-200 border-slate-700"
          }`}>
            <Timer className="w-4 h-4" />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-2xl mx-auto pt-28 pb-12 px-6 relative z-10">
        
        {/* Info Kategori & Nomor Soal */}
        <div className="mb-8 flex items-center justify-between">
            <span className="bg-white/80 backdrop-blur border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              {currentQ.category}
            </span>
            <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">
              Question {currentQuestionIndex + 1} <span className="text-slate-300">/</span> {questions.length}
            </span>
        </div>

        {/* 5. ANIMATE PRESENCE
           Library Framer Motion untuk animasi transisi antar soal. 
           `mode="wait"` memastikan soal lama keluar dulu baru soal baru masuk. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex} // Key berubah = trigger animasi ulang
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {/* Card Pertanyaan */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-1 mb-8">
              {/* dangerouslySetInnerHTML digunakan karena API OpenTDB mereturn HTML Entities (contoh: Don't) */}
              <h2 
                className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug"
                dangerouslySetInnerHTML={{ __html: currentQ.question }}
              />
            </div>

            {/* List Pilihan Jawaban */}
            <div className="space-y-3">
              {allAnswers.map((answer, idx) => {
                const isSelected = selectedAnswer === answer;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(answer)}
                    disabled={selectedAnswer !== null} // Disable semua tombol setelah memilih
                    className={`group relative w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-sm
                      ${isSelected 
                        ? "border-blue-500 bg-blue-50/80 shadow-blue-500/10 scale-[1.01]" 
                        : "border-white bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
                      }
                    `}
                  >
                    {/* ... (Isi tombol jawaban) ... */}
                    <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 shadow-sm
                            ${isSelected 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-slate-50 text-slate-500 border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 group-hover:bg-blue-50"}
                        `}>
                        {String.fromCharCode(65 + idx)}
                        </div>
                        <span 
                        className={`text-lg font-medium transition-colors duration-300 ${isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900"}`}
                        dangerouslySetInnerHTML={{ __html: answer }}
                        />
                    </div>
                    {/* ... (Icon Check/Circle) ... */}
                    <div className="relative z-10">
                      {isSelected ? (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                           <CheckCircle2 className="w-6 h-6 text-blue-500" />
                         </motion.div>
                      ) : (
                         <Circle className="w-6 h-6 text-slate-200 group-hover:text-blue-300 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}