"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { RotateCcw, CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { QUIZ_CONFIG } from "@/lib/constants";

// Interface Props untuk komponen kecil StatCard agar type-safe
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  borderColor: string;
  delay: number;
}

export default function ResultPage() {
  const router = useRouter();
  const { questions, answers, username, timeLeft, resetQuiz } = useQuizStore();

  // Redirect ke home jika data kosong (misal user refresh paksa & clear storage)
  useEffect(() => {
    if (questions.length === 0) router.replace("/");
  }, [questions, router]);

  // --- 1. LOGIC KALKULASI SKOR ---
  const totalQuestions = questions.length;
  // Reduce array soal untuk menghitung berapa jawaban user yang cocok dengan kunci jawaban
  const correctCount = questions.reduce((acc, q, idx) => {
    return answers[idx] === q.correct_answer ? acc + 1 : acc;
  }, 0);
  const incorrectCount = totalQuestions - correctCount;
  // Hitung persentase skor (bulatkan ke integer)
  const score = Math.round((correctCount / totalQuestions) * 100);
  
  // --- 2. LOGIC KALKULASI WAKTU ---
  // Waktu terpakai = Total Waktu Awal - Sisa Waktu Akhir
  const timeTaken = QUIZ_CONFIG.TOTAL_TIME - timeLeft; 

  // --- 3. LOGIC TEMA & FEEDBACK ---
  // Tentukan apakah user lulus (Pass) atau tidak berdasarkan Config
  const isPass = score >= QUIZ_CONFIG.PASSING_SCORE;
  
  const feedbackMessage = isPass 
    ? "Impressive! You've mastered the material. Keep up the great work!" 
    : "It's okay, learning takes time. Don't give up, let's try again until you succeed!";

  // Set warna UI dinamis (Hijau jika Pass, Orange jika Fail)
  const theme = isPass 
    ? { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", ring: "stroke-green-500", label: "Outstanding!" }
    : { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", ring: "stroke-orange-500", label: "Keep Trying!" };

  // --- 4. LOGIC ANIMASI LINGKARAN (SVG) ---
  // Menghitung circumference (keliling lingkaran) dan offset untuk animasi stroke
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (questions.length === 0) return null;

  return (
    <main className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
      
      {/* Background Blobs... */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
      >
        {/* HEADER: Identity Card */}
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div>
             <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Report Card</p>
             <h2 className="text-white font-bold text-lg">{username}</h2>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        </div>

        <div className="p-8">
          
          {/* SECTION ATAS: Circular Progress Bar & Summary */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10">
            
            {/* SVG Circular Animation */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring (Abu-abu tipis) */}
                <circle cx="50%" cy="50%" r={radius} className="stroke-slate-100 fill-none" strokeWidth="12" />
                
                {/* Progress Ring (Berwarna & Teranimasi) */}
                {/* strokeDashoffset mengatur seberapa panjang garis yang muncul */}
                <motion.circle
                  cx="50%" cy="50%" r={radius}
                  className={`${theme.ring} fill-none`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>
              
              {/* Angka Skor di Tengah */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="text-5xl font-black text-slate-900 tracking-tighter"
                >
                  {score}
                </motion.span>
                <span className="text-xs text-slate-400 uppercase font-bold mt-1">Total Score</span>
              </div>
            </div>

            {/* Teks Deskripsi Hasil */}
            <div className="text-center md:text-left flex-1 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className={`text-3xl font-bold ${theme.color} mb-2`}>{theme.label}</h1>
                <p className="text-slate-600 leading-relaxed">
                  {feedbackMessage}
                </p>
              </motion.div>
            </div>
          </div>

          {/* SECTION TENGAH: Statistik Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard 
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              label="Correct Answers"
              value={`${correctCount}`}
              bg="bg-green-50"
              borderColor="border-green-100"
              delay={0.6}
            />
            <StatCard 
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              label="Wrong Answers"
              value={`${incorrectCount}`}
              bg="bg-red-50"
              borderColor="border-red-100"
              delay={0.7}
            />
            <StatCard 
              icon={<Clock className="w-5 h-5 text-blue-500" />}
              label="Time Spent"
              value={`${timeTaken}s`}
              bg="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.8}
            />
          </div>

          {/* SECTION BAWAH: Tombol Play Again */}
          <div className="flex justify-center">
            <button
              onClick={() => { resetQuiz(); router.replace("/"); }}
              className="w-full md:w-auto px-12 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 group"
            >
              <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-180" /> 
              Play Again
            </button>
          </div>

        </div>
      </motion.div>
    </main>
  );
}

// Komponen Kecil StatCard untuk kerapihan kode
function StatCard({ icon, label, value, bg, borderColor, delay }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-2xl border ${borderColor} ${bg} flex items-center gap-4`}
    >
      <div className="bg-white p-2.5 rounded-xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </motion.div>
  );
}