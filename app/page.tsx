"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { Play, Loader2, Sparkles, BrainCircuit, Timer, FileQuestion, ChevronRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { QUIZ_CONFIG } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  
  // State lokal untuk input nama (sebelum dikirim ke store)
  const [inputName, setInputName] = useState("");
  
  // 1. MENGAMBIL STATE & ACTIONS DARI ZUSTAND
  // Kita destructure apa saja yang dibutuhkan agar code lebih bersih.
  const { startNewQuiz, isLoading, resetQuiz, username, questions, isFinished } = useQuizStore();
  
  // 2. LOGIC PENGECEKAN SESI (FITUR RESUME - POIN H)
  // User dianggap punya sesi aktif jika:
  // a. Ada data soal di memory (questions.length > 0)
  // b. Kuis belum ditandai selesai (!isFinished)
  const hasActiveSession = questions.length > 0 && !isFinished;

  // 3. HANDLER SAAT TOMBOL START DITEKAN
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman standar browser
    if (!inputName.trim()) return; // Validasi input kosong

    // Panggil action async untuk fetch soal dari API via Store
    await startNewQuiz(inputName);
    
    // Jika sukses, pindah ke halaman kuis
    router.push("/quiz");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 font-sans p-6">
      
      {/* Background Decoration (Blobs) untuk estetika modern */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Container Utama dengan Animasi Masuk (Fade In + Slide Up) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 overflow-hidden">
          
          {/* --- HEADER SECTION --- */}
          <div className="bg-slate-900 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg ring-4 ring-slate-800">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Frontend Challenge</h1>
              <p className="mt-2 text-sm text-slate-400">Technical Test - PT DOT Indonesia</p>
            </div>
          </div>

          {/* --- INFO BADGES (Dynamic Config) --- */}
          {/* Menggunakan value dari QUIZ_CONFIG agar mudah diubah tanpa hardcode UI */}
          <div className="flex border-b border-slate-100 bg-white/50">
            <div className="flex-1 flex flex-col items-center justify-center py-4 border-r border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <FileQuestion className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Questions</span>
              </div>
              <span className="font-bold text-slate-900">{QUIZ_CONFIG.TOTAL_QUESTIONS} Items</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Timer className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Time</span>
              </div>
              <span className="font-bold text-slate-900">{QUIZ_CONFIG.TOTAL_TIME} Seconds</span>
            </div>
          </div>

          {/* --- CONTENT AREA (Conditional Rendering) --- */}
          <div className="p-8">
            {hasActiveSession ? (
              // 4A. TAMPILAN RESUME (JIKA USER KEMBALI)
              // Tampilkan opsi lanjut jika sesi terdeteksi
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
                  <p className="text-sm text-blue-800 mb-1">Welcome back,</p>
                  <h3 className="text-lg font-bold text-slate-900">{username}</h3>
                  <p className="text-xs text-slate-500 mt-2">You have an unfinished quiz session.</p>
                </div>

                <button
                  onClick={() => router.push("/quiz")}
                  className="w-full group flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Resume Quiz
                </button>
                
                {/* Opsi Reset untuk menghapus localStorage */}
                <button
                  onClick={() => { resetQuiz(); setInputName(""); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Reset / Switch Account
                </button>
              </motion.div>
            ) : (
              // 4B. TAMPILAN LOGIN NORMAL (USER BARU)
              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Enter your name..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      disabled={isLoading}
                    />
                    <Sparkles className="absolute right-4 top-4 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputName}
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      <span className="text-slate-200">Preparing...</span>
                    </>
                  ) : (
                    <>
                      Start Challenge 
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
             <p className="text-[10px] text-slate-400 font-medium tracking-wide">POWERED BY OPENTDB API</p>
          </div>
          
        </div>
      </motion.div>
    </main>
  );
}