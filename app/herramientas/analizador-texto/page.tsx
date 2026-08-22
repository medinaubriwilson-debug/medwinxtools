"use client";

import { useMemo, useState } from "react";

export default function AnalizadorTextoPage() {
 const [text, setText] = useState("");

 const stats = useMemo(() => {
 const trimmed = text.trim();

 const words = trimmed
 ? trimmed.split(/\s+/).filter(Boolean)
 : [];

 const characters = text.length;

 const charactersNoSpaces = text.replace(/\s/g, "").length;

 const lines = text
 ? text.split(/\r?\n/).length
 : 0;

 const paragraphs = trimmed
 ? trimmed.split(/\n\s*\n/).filter(Boolean).length
 : 0;

 const sentences = trimmed
 ? trimmed.split(/[.!?]+/).filter((item) => item.trim()).length
 : 0;

 const readingTime = Math.max(
 0,
 Math.ceil(words.length / 200)
 );

 const frequency: Record<string, number> = {};

 words.forEach((word) => {
 const clean = word
 .toLowerCase()
 .replace(/[.,!?;:"()[\]{}]/g, "");

 if (!clean) return;

 frequency[clean] = (frequency[clean] || 0) + 1;
 });

 const topWords = Object.entries(frequency)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 10);

 return {
 words: words.length,
 characters,
 charactersNoSpaces,
 lines,
 paragraphs,
 sentences,
 readingTime,
 topWords,
 };
 }, [text]);

 const uppercase = () => {
 setText(text.toUpperCase());
 };

 const lowercase = () => {
 setText(text.toLowerCase());
 };

 const cleanSpaces = () => {
 setText(
 text
 .replace(/[ \t]+/g, " ")
 .replace(/\n{3,}/g, "\n\n")
 .trim()
 );
 };

 const clear = () => {
 setText("");
 };

 return (
 <main className="min-h-screen bg-[#09090b] text-white">
 {/* HEADER */}
 <header className="border-b border-white/10 bg-[#09090b]/90">
 <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
 <a href="/" className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black text-black">
 M
 </div>

 <span className="text-lg font-bold">
 Medwinx<span className="text-zinc-500">Tools</span>
 </span>
 </a>

 <a
 href="/herramientas"
 className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
 >
 ← Herramientas
 </a>
 </div>
 </header>

 {/* CONTENT */}
 <section className="mx-auto max-w-7xl px-5 py-12">
 <div className="mb-10">
 <p className="mb-2 text-sm uppercase tracking-widest text-zinc-600">
 MedwinxTools / Texto
 </p>

 <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
 Analizador de texto
 </h1>

 <p className="mt-3 max-w-2xl text-zinc-500">
 Analiza palabras, caracteres, párrafos, oraciones y tiempo de
 lectura.
 </p>
 </div>

 {/* EDITOR */}
 <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
 <span className="text-sm font-semibold">
 Tu texto
 </span>

 <div className="flex flex-wrap gap-2">
 <button
 onClick={uppercase}
 className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
 >
 MAYÚSCULAS
 </button>

 <button
 onClick={lowercase}
 className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
 >
 minúsculas
 </button>

 <button
 onClick={cleanSpaces}
 className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
 >
 Limpiar espacios
 </button>

 <button
 onClick={clear}
 className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-white"
 >
 Limpiar
 </button>
 </div>
 </div>

 <textarea
 value={text}
 onChange={(event) => setText(event.target.value)}
 placeholder="Escribe o pega tu texto aquí..."
 spellCheck
 className="min-h-[350px] w-full resize-y bg-black/20 p-6 text-base leading-7 text-zinc-300 outline-none placeholder:text-zinc-800"
 />

 <div className="border-t border-white/10 px-5 py-3 text-xs text-zinc-700">
 {stats.characters} caracteres
 </div>
 </div>

 {/* STATISTICS */}
 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
 <Stat
 value={stats.words}
 label="Palabras"
 />

 <Stat
 value={stats.characters}
 label="Caracteres"
 />

 <Stat
 value={stats.charactersNoSpaces}
 label="Sin espacios"
 />

 <Stat
 value={stats.lines}
 label="Líneas"
 />

 <Stat
 value={stats.paragraphs}
 label="Párrafos"
 />

 <Stat
 value={stats.sentences}
 label="Oraciones"
 />
 </div>

 {/* READING */}
 <div className="mt-6 grid gap-5 lg:grid-cols-2">
 <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
 <p className="text-xs uppercase tracking-widest text-zinc-700">
 Lectura
 </p>

 <div className="mt-3 text-3xl font-black">
 {stats.readingTime}
 <span className="ml-2 text-base font-normal text-zinc-600">
 {stats.readingTime === 1
 ? "minuto"
 : "minutos"}
 </span>
 </div>

 <p className="mt-2 text-sm text-zinc-600">
 Tiempo estimado de lectura a unas 200 palabras por minuto.
 </p>
 </div>

 {/* TOP WORDS */}
 <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
 <p className="text-xs uppercase tracking-widest text-zinc-700">
 Palabras frecuentes
 </p>

 {stats.topWords.length === 0 ? (
 <p className="mt-5 text-sm text-zinc-700">
 Escribe algo para analizarlo.
 </p>
 ) : (
 <div className="mt-4 flex flex-wrap gap-2">
 {stats.topWords.map(([word, count]) => (
 <span
 key={word}
 className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-400"
 >
 {word}
 <span className="ml-2 text-zinc-700">
 {count}
 </span>
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 </section>

 <footer className="border-t border-white/10">
 <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-zinc-700">
 © 2026 MedwinxTools
 </div>
 </footer>
 </main>
 );
}

function Stat({
 value,
 label,
}: {
 value: number;
 label: string;
}) {
 return (
 <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
 <div className="text-2xl font-black">
 {value.toLocaleString()}
 </div>

 <div className="mt-1 text-xs text-zinc-600">
 {label}
 </div>
 </div>
 );
}