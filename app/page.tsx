"use client";

import { useMemo, useState } from "react";
import { tools } from "@/lib/tools";

const categories = [
"Todas",
"PDF",
"Imágenes",
"Texto",
"Calculadoras",
"Programación",
"Generadores",
];

export default function Home() {
const [search, setSearch] = useState("");
const [category, setCategory] = useState("Todas");

const filteredTools = useMemo(() => {
return tools.filter((tool) => {
const matchesSearch =
tool.name.toLowerCase().includes(search.toLowerCase()) ||
tool.description.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    category === "Todas" || tool.category === category;

  return matchesSearch && matchesCategory;
});

}, [search, category]);

return (
<main className="min-h-screen bg-[#09090b] text-white">
{/* NAVBAR */}
<header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
<div className="flex items-center gap-3">
<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-black">
M
</div>

        <span className="text-lg font-bold tracking-tight">
          Medwinx<span className="text-zinc-500">Tools</span>
        </span>
      </div>

      <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
      <a
  href="/herramientas"
  className="transition hover:text-white"
>
  Herramientas
</a>

        <a href="#categorias" className="transition hover:text-white">
          Categorías
        </a>

        <a href="#sobre" className="transition hover:text-white">
          Sobre nosotros
        </a>
      </nav>

      <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white">
        Explorar
      </button>
    </div>
  </header>

  {/* HERO */}
  <section className="relative overflow-hidden">
    <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

    <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-24 text-center md:pt-32">
      <div className="mb-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
        ⚡ Herramientas simples. Resultados rápidos.
      </div>

      <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
        Todas las herramientas
        <br />
        <span className="text-zinc-500">que necesitas.</span>
      </h1>

      <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
        MedwinxTools reúne herramientas gratuitas para trabajar con
        documentos, imágenes, texto, programación, cálculos y mucho más.
      </p>

      {/* SEARCH */}
      <div className="mt-10 w-full max-w-2xl">
        <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] p-2 shadow-2xl shadow-black/20 transition focus-within:border-white/20">
          <span className="px-4 text-xl text-zinc-500">⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="¿Qué herramienta estás buscando?"
            className="h-12 flex-1 bg-transparent text-white outline-none placeholder:text-zinc-600"
          />

          <div className="hidden rounded-lg bg-white/10 px-3 py-2 text-xs text-zinc-500 sm:block">
            Buscar
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* CATEGORIES */}
  <section id="categorias" className="mx-auto max-w-7xl px-5">
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((item) => (
        <button
          key={item}
          onClick={() => setCategory(item)}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
            category === item
              ? "bg-white text-black"
              : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  </section>

  {/* TOOLS */}
  <section
    id="herramientas"
    className="mx-auto max-w-7xl px-5 pb-24 pt-8"
  >
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-500">
          MEDWINXTOOLS
        </p>

        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Herramientas populares
        </h2>
      </div>

      <span className="text-sm text-zinc-600">
        {filteredTools.length} herramientas
      </span>
    </div>

    {filteredTools.length === 0 ? (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
        <div className="mb-4 text-4xl">🔎</div>

        <h3 className="text-lg font-semibold">
          No encontramos esa herramienta
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Prueba con otra búsqueda o categoría.
        </p>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
   {filteredTools.map((tool) => (
  <a
    key={tool.name}
    href={tool.available ? tool.href : "#"}
    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
  >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
                {tool.icon}
              </div>

              <span className="text-zinc-700 transition group-hover:text-zinc-400">
                ↗
              </span>
            </div>

            <h3 className="font-semibold text-white">{tool.name}</h3>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-500">
              {tool.description}
            </p>

            <div className="mt-5 flex items-center justify-between text-xs">
  <span className="text-zinc-600">
    {tool.category}
  </span>

  {tool.available ? (
    <span className="text-zinc-400">
      Disponible
    </span>
  ) : (
    <span className="text-zinc-700">
      Próximamente
    </span>
  )}
</div>
          </a>
        ))}
      </div>
    )}
  </section>

  {/* ABOUT */}
  <section
    id="sobre"
    className="border-t border-white/10 bg-white/[0.02]"
  >
    <div className="mx-auto max-w-4xl px-5 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">
        M
      </div>

      <h2 className="text-3xl font-bold">
        Bienvenido a MedwinxTools
      </h2>

      <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-500">
        Una plataforma creada para reunir herramientas útiles en un solo
        lugar. Nuestro objetivo es hacer que las tareas digitales del día
        a día sean más rápidas, sencillas y accesibles.
      </p>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="border-t border-white/10">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        © 2026 MedwinxTools. Todos los derechos reservados.
      </span>

      <div className="flex gap-5">
        <a href="#" className="transition hover:text-zinc-300">
          Privacidad
        </a>

        <a href="#" className="transition hover:text-zinc-300">
          Términos
        </a>
      </div>
    </div>
  </footer>
</main>

);
}