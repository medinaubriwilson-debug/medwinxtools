"use client";

import { useState } from "react";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setOutput("");
      setError("El JSON no es válido. Revisa la sintaxis.");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);

      setOutput(JSON.stringify(parsed));
      setError("");
    } catch {
      setOutput("");
      setError("El JSON no es válido. Revisa la sintaxis.");
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);

      setError("");
      setOutput("✓ JSON válido");
    } catch {
      setOutput("");
      setError("✕ JSON inválido");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
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
            MedwinxTools / Programación
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            JSON Formatter
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Formatea, minimiza y valida código JSON directamente desde tu
            navegador.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mb-5 flex flex-wrap gap-3">
          <button
            onClick={formatJson}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            Formatear
          </button>

          <button
            onClick={minifyJson}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Minimizar
          </button>

          <button
            onClick={validateJson}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Validar
          </button>

          <button
            onClick={clearAll}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
          >
            Limpiar
          </button>
        </div>

        {/* EDITORS */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* INPUT */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <span className="text-sm font-semibold">
                  Entrada
                </span>

                <span className="ml-2 text-xs text-zinc-700">
                  JSON
                </span>
              </div>

              <span className="text-xs text-zinc-700">
                {input.length} caracteres
              </span>
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`{
  "nombre": "MedwinxTools",
  "version": 1
}`}
              spellCheck={false}
              className="min-h-[450px] w-full resize-none bg-black/20 p-5 font-mono text-sm leading-6 text-zinc-300 outline-none placeholder:text-zinc-800"
            />
          </div>

          {/* OUTPUT */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <span className="text-sm font-semibold">
                  Resultado
                </span>

                <span className="ml-2 text-xs text-zinc-700">
                  JSON
                </span>
              </div>

              <button
                onClick={copyOutput}
                disabled={!output}
                className="text-xs text-zinc-600 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Copiar
              </button>
            </div>

            <pre className="min-h-[450px] overflow-auto bg-black/20 p-5 font-mono text-sm leading-6 text-zinc-300">
              {output || (
                <span className="text-zinc-800">
                  El resultado aparecerá aquí...
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* INFO */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Info
            title="Formatear"
            text="Organiza tu JSON con sangría para hacerlo más fácil de leer."
          />

          <Info
            title="Minimizar"
            text="Elimina espacios innecesarios para reducir su tamaño."
          />

          <Info
            title="Validar"
            text="Comprueba rápidamente si la estructura del JSON es válida."
          />
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

function Info({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h2 className="font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-600">
        {text}
      </p>
    </div>
  );
}