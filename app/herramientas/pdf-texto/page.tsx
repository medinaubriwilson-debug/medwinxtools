"use client";

import { useState } from "react";

type ExtractedPage = {
  number: number;
  text: string;
  selected: boolean;
};

export default function PdfTextoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ExtractedPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<"all" | number>("all");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");

  const loadPdf = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Selecciona un archivo PDF válido.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);
      setText("");
      setPages([]);

      /*
       * IMPORTANTE:
       * pdfjs-dist se carga dinámicamente solamente cuando
       * el usuario selecciona un PDF.
       *
       * Esto evita que Next.js intente ejecutar PDF.js
       * durante el prerender del servidor.
       */
      const pdfjsLib = await import(
        "pdfjs-dist/legacy/build/pdf.mjs"
      );

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib
        .getDocument({
          data: arrayBuffer,
        })
        .promise;

      const extractedPages: ExtractedPage[] = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page = await pdf.getPage(pageNumber);

        const content = await page.getTextContent();

        const pageText = content.items
          .map((item: any) => {
            if ("str" in item) {
              return item.str;
            }

            return "";
          })
          .join(" ");

        extractedPages.push({
          number: pageNumber,
          text: pageText.trim(),
          selected: true,
        });

        setProgress(
          Math.round(
            (pageNumber / pdf.numPages) * 100
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 0)
        );
      }

      setFile(selectedFile);
      setPages(extractedPages);
      setSelectedPage("all");

      const completeText = extractedPages
        .map(
          (page) =>
            `--- Página ${page.number} ---\n\n${page.text}`
        )
        .join("\n\n");

      setText(completeText);

      if (!completeText.trim()) {
        setMessage(
          "No se encontró texto seleccionable. Es posible que el PDF sea un documento escaneado."
        );
      } else {
        setMessage(
          `${pdf.numPages} ${
            pdf.numPages === 1 ? "página procesada" : "páginas procesadas"
          }.`
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo extraer el texto del PDF. Comprueba que el archivo sea válido."
      );
    } finally {
      setLoading(false);
    }
  };

  const changePage = (value: "all" | number) => {
    setSelectedPage(value);

    if (value === "all") {
      const completeText = pages
        .map(
          (page) =>
            `--- Página ${page.number} ---\n\n${page.text}`
        )
        .join("\n\n");

      setText(completeText);
      return;
    }

    const page = pages.find(
      (item) => item.number === value
    );

    if (page) {
      setText(
        `--- Página ${page.number} ---\n\n${page.text}`
      );
    }
  };

  const copyText = async () => {
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);

      setMessage("✓ Texto copiado al portapapeles.");
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo copiar el texto automáticamente."
      );
    }
  };

  const downloadText = () => {
    if (!text.trim()) return;

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const baseName =
      file?.name
        .replace(/\.pdf$/i, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_") ||
      "documento";

    link.download = `${baseName}-texto.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    setMessage("✓ Archivo de texto descargado.");
  };

  const clearText = () => {
    setText("");

    setMessage("Texto eliminado.");
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setText("");
    setProgress(0);
    setMessage("");
    setSelectedPage("all");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black text-black">
              M
            </div>

            <span className="text-lg font-bold">
              Medwinx
              <span className="text-zinc-500">
                Tools
              </span>
            </span>
          </a>

          <a
            href="/herramientas"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ← Herramientas
          </a>
        </div>
      </header>

      {/* CONTENIDO */}

      <section className="mx-auto max-w-6xl px-5 py-14">
        {/* TITULO */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            📝
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            PDF a Texto
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Extrae el texto de tus documentos PDF
            directamente desde tu navegador.
          </p>
        </div>

        {/* SELECCIONAR PDF */}

        {!file && !loading && (
          <label className="group block cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.025] p-14 text-center transition hover:border-white/25 hover:bg-white/[0.04]">
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) =>
                loadPdf(
                  event.target.files?.[0] ?? null
                )
              }
            />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl">
              📄
            </div>

            <h2 className="mt-7 text-xl font-bold">
              Selecciona un PDF
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Extraeremos el texto de todas sus páginas.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar PDF
            </div>
          </label>
        )}

        {/* PROCESANDO */}

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center">
            <div className="text-3xl">
              📝
            </div>

            <p className="mt-4 font-semibold">
              Extrayendo texto...
            </p>

            <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-zinc-600">
              {progress}%
            </p>
          </div>
        )}

        {/* HERRAMIENTA */}

        {file && pages.length > 0 && !loading && (
          <div className="space-y-5">
            {/* ARCHIVO */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-2xl">
                  📄
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {pages.length}{" "}
                    {pages.length === 1
                      ? "página"
                      : "páginas"}
                  </p>
                </div>

                <button
                  onClick={reset}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* SELECTOR DE PAGINA */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="font-bold">
                Páginas
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Selecciona qué parte del documento
                quieres visualizar.
              </p>

              <select
                value={selectedPage}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "all") {
                    changePage("all");
                  } else {
                    changePage(Number(value));
                  }
                }}
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="all">
                  Todas las páginas
                </option>

                {pages.map((page) => (
                  <option
                    key={page.number}
                    value={page.number}
                  >
                    Página {page.number}
                  </option>
                ))}
              </select>
            </div>

            {/* TEXTO */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">
                    Texto extraído
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Puedes editar el texto antes de
                    descargarlo.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyText}
                    disabled={!text.trim()}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Copiar
                  </button>

                  <button
                    onClick={clearText}
                    disabled={!text.trim()}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                placeholder="El texto extraído aparecerá aquí..."
                className="min-h-[450px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-white/20"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={copyText}
                  disabled={!text.trim()}
                  className="flex-1 rounded-2xl border border-white/10 py-4 font-bold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  📋 Copiar texto
                </button>

                <button
                  onClick={downloadText}
                  disabled={!text.trim()}
                  className="flex-1 rounded-2xl bg-white py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↓ Descargar TXT
                </button>
              </div>
            </div>

            {/* MENSAJE */}

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center text-sm text-zinc-500">
                {message}
              </div>
            )}
          </div>
        )}

        {/* PRIVACIDAD */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒{" "}
          <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          el PDF se procesa directamente en tu
          navegador. No se envía a un servidor.
        </div>
      </section>
    </main>
  );
}