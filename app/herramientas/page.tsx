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

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        tool.name.toLowerCase().includes(searchText) ||
        tool.description.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "Todas" || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a
            href="/"
            className="flex items-center gap-3 transition hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black text-black">
              M
            </div>

            <span className="text-lg font-bold">
              Medwinx<span className="text-zinc-500">Tools</span>
            </span>
          </a>

          <a
            href="/"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Inicio
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-600">
            MedwinxTools
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Todas nuestras herramientas
          </h1>

          <p className="mt-5 text-base leading-7 text-zinc-500 sm:text-lg">
            Encuentra herramientas gratuitas para trabajar con archivos,
            imágenes, texto, cálculos, programación y mucho más.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mt-10 max-w-2xl">
          <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-white/20">
            <span className="px-4 text-xl text-zinc-600">
              ⌕
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar una herramienta..."
              className="h-12 flex-1 bg-transparent text-white outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="flex gap-2 overflow-x-auto pb-5">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm transition ${
                category === item
                  ? "bg-white font-semibold text-black"
                  : "border border-white/10 bg-white/[0.03] text-zinc-500 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-700">
              Catálogo
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {category}
            </h2>
          </div>

          <span className="text-sm text-zinc-700">
            {filteredTools.length} herramientas
          </span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-24 text-center">
            <div className="text-4xl">🔎</div>

            <h2 className="mt-4 text-xl font-bold">
              No encontramos resultados
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Intenta buscar con otro término.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.available ? tool.href : "#"}
                className={`group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition ${
                  tool.available
                    ? "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                    : "cursor-default opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
                    {tool.icon}
                  </div>

                  {tool.available ? (
                    <span className="text-zinc-700 transition group-hover:text-zinc-300">
                      ↗
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-zinc-700">
                      Próximamente
                    </span>
                  )}
                </div>

                <h3 className="mt-6 font-semibold">
                  {tool.name}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-500">
                  {tool.description}
                </p>

                <div className="mt-5 text-xs text-zinc-700">
                  {tool.category}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-zinc-700">
          © 2026 MedwinxTools
        </div>
      </footer>
    </main>
  );
}