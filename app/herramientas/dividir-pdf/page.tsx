"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function DividirPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Selecciona un archivo PDF válido.");
      return;
    }

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selectedFile);
      setTotalPages(pdf.getPageCount());
      setPages("");
      setMessage("");
    } catch {
      setFile(null);
      setTotalPages(0);
      setMessage("No se pudo leer el PDF.");
    }
  };

  const parsePages = (
    value: string,
    maxPages: number
  ): number[] => {
    const result: number[] = [];

    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startText, endText] = part.split("-");

        const start = Number(startText);
        const end = Number(endText);

        if (
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          start < 1 ||
          end > maxPages ||
          start > end
        ) {
          continue;
        }

        for (let page = start; page <= end; page++) {
          result.push(page);
        }
      } else {
        const page = Number(part);

        if (
          Number.isInteger(page) &&
          page >= 1 &&
          page <= maxPages
        ) {
          result.push(page);
        }
      }
    }

    return [...new Set(result)];
  };

  const splitPdf = async () => {
    if (!file) {
      setMessage("Primero selecciona un PDF.");
      return;
    }

    const selectedPages = parsePages(pages, totalPages);

    if (selectedPages.length === 0) {
      setMessage(
        "Escribe las páginas que quieres extraer. Ejemplo: 1,3,5 o 1-4."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const bytes = await file.arrayBuffer();

      const originalPdf = await PDFDocument.load(bytes);

      const newPdf = await PDFDocument.create();

      const pageIndexes = selectedPages.map(
        (page) => page - 1
      );

      const copiedPages = await newPdf.copyPages(
        originalPdf,
        pageIndexes
      );

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const outputBytes = await newPdf.save();

      const blob = new Blob(
        [new Uint8Array(outputBytes)],
        {
          type: "application/pdf",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "medwinxtools-pdf-dividido.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        `✓ PDF creado con ${selectedPages.length} página(s).`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo crear el PDF. Comprueba que el archivo sea válido."
      );
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPages("");
    setTotalPages(0);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
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
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Dividir PDF
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Extrae las páginas que necesites de un archivo PDF.
          </p>
        </div>

        {/* FILE SELECTOR */}
        {!file ? (
          <label className="block cursor-pointer rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-12 text-center transition hover:border-white/30 hover:bg-white/[0.04]">
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-3xl">
              📄
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Selecciona un PDF
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Elige el documento que quieres dividir.
            </p>

            <div className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">
              Seleccionar PDF
            </div>
          </label>
        ) : (
          <>
            {/* FILE INFO */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl">
                  📄
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">
                    {file.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-600">
                    {totalPages}{" "}
                    {totalPages === 1
                      ? "página"
                      : "páginas"}
                    {" · "}
                    {formatBytes(file.size)}
                  </p>
                </div>

                <button
                  onClick={clear}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-white/5 hover:text-white"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* PAGE INPUT */}
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <label className="text-sm font-semibold">
                Páginas que quieres extraer
              </label>

              <p className="mt-2 text-sm text-zinc-600">
                Puedes escribir páginas individuales o rangos.
              </p>

              <input
                value={pages}
                onChange={(event) =>
                  setPages(event.target.value)
                }
                placeholder="Ejemplo: 1,3,5 o 1-4"
                className="mt-5 h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 font-mono text-sm text-white outline-none placeholder:text-zinc-800 focus:border-white/20"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Example
                  text="1"
                  onClick={() => setPages("1")}
                />

                <Example
                  text={`1-${Math.min(3, totalPages)}`}
                  onClick={() =>
                    setPages(
                      `1-${Math.min(3, totalPages)}`
                    )
                  }
                />

                <Example
                  text="1,3,5"
                  onClick={() => setPages("1,3,5")}
                />
              </div>

              <button
                onClick={splitPdf}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Creando PDF..."
                  : "Extraer páginas"}
              </button>

              {message && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-zinc-400">
                  {message}
                </div>
              )}
            </div>
          </>
        )}

        {/* PRIVACY */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex gap-4">
            <div className="text-2xl">🔒</div>

            <div>
              <h2 className="font-semibold">
                Procesamiento local
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                El PDF se procesa directamente en tu navegador.
                No necesitas subirlo a un servidor.
              </p>
            </div>
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

function Example({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-600 hover:bg-white/5 hover:text-white"
    >
      {text}
    </button>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
}