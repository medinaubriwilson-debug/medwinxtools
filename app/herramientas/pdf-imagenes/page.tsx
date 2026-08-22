"use client";

import { useEffect, useState } from "react";

type PdfPage = {
  number: number;
  canvas: HTMLCanvasElement;
  preview: string;
  selected: boolean;
};

type ImageFormat = "jpg" | "png";

export default function PdfImagenesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      pages.forEach((page) => {
        URL.revokeObjectURL(page.preview);
      });
    };
  }, []);

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

      const oldPages = pages;

      oldPages.forEach((page) => {
        URL.revokeObjectURL(page.preview);
      });

      setPages([]);

      const buffer = await selectedFile.arrayBuffer();

      const pdfjsLib = await import(
  "pdfjs-dist/legacy/build/pdf.mjs"
);

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({
        data: buffer,
      }).promise;

      const generatedPages: PdfPage[] = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 1.5,
        });

        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("No se pudo crear el canvas.");
        }

       await page.render({
  canvas: canvas,
  viewport: viewport,
}).promise;

        const preview = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        generatedPages.push({
          number: pageNumber,
          canvas,
          preview,
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
      setPages(generatedPages);
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo leer el PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (number: number) => {
    setPages((current) =>
      current.map((page) =>
        page.number === number
          ? {
              ...page,
              selected: !page.selected,
            }
          : page
      )
    );
  };

  const selectAll = () => {
    setPages((current) =>
      current.map((page) => ({
        ...page,
        selected: true,
      }))
    );
  };

  const deselectAll = () => {
    setPages((current) =>
      current.map((page) => ({
        ...page,
        selected: false,
      }))
    );
  };

  const convertPages = async () => {
    const selectedPages = pages.filter(
      (page) => page.selected
    );

    if (selectedPages.length === 0) {
      setMessage(
        "Selecciona al menos una página."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);

      for (
        let index = 0;
        index < selectedPages.length;
        index++
      ) {
        const page = selectedPages[index];

        const mime =
          format === "png"
            ? "image/png"
            : "image/jpeg";

        const imageQuality =
          format === "jpg"
            ? quality
            : undefined;

        const dataUrl = page.canvas.toDataURL(
          mime,
          imageQuality
        );

        const blob = dataUrlToBlob(dataUrl);

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        const baseName =
          file?.name
            .replace(/\.pdf$/i, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_") ||
          "documento";

        link.download =
          `${baseName}-pagina-${page.number}.${format}`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        setProgress(
          Math.round(
            ((index + 1) / selectedPages.length) *
              100
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 150)
        );
      }

      setMessage(
        `✓ ${selectedPages.length} ${
          selectedPages.length === 1
            ? "imagen creada"
            : "imágenes creadas"
        }.`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudieron convertir las páginas."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    pages.forEach((page) => {
      URL.revokeObjectURL(page.preview);
    });

    setFile(null);
    setPages([]);
    setProgress(0);
    setMessage("");
  };

  const selectedCount = pages.filter(
    (page) => page.selected
  ).length;

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
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            ← Herramientas
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-14">
        {/* TITLE */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            📸
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            PDF a Imágenes
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Convierte las páginas de un PDF en imágenes
            JPG o PNG.
          </p>
        </div>

        {/* UPLOAD */}

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
              Verás una vista previa de todas sus páginas.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar PDF
            </div>
          </label>
        )}

        {/* LOADING */}

        {loading && pages.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center">
            <div className="text-3xl">
              📄
            </div>

            <p className="mt-4 font-semibold">
              Procesando PDF...
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

        {/* TOOL */}

        {file && pages.length > 0 && (
          <div className="space-y-5">
            {/* FILE */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
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
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-500 hover:bg-white/5 hover:text-white"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* SETTINGS */}

            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              {/* PAGES */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Páginas
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      {selectedCount} de{" "}
                      {pages.length} seleccionadas
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                    >
                      Todas
                    </button>

                    <button
                      onClick={deselectAll}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                    >
                      Ninguna
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {pages.map((page) => (
                    <button
                      key={page.number}
                      onClick={() =>
                        togglePage(page.number)
                      }
                      className={`group relative overflow-hidden rounded-2xl border-2 transition ${
                        page.selected
                          ? "border-white"
                          : "border-white/10 opacity-50"
                      }`}
                    >
                      <img
                        src={page.preview}
                        alt={`Página ${page.number}`}
                        className="aspect-[3/4] w-full bg-black object-contain"
                      />

                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/80 px-3 py-2">
                        <span className="text-xs">
                          Página {page.number}
                        </span>

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            page.selected
                              ? "border-white bg-white text-black"
                              : "border-white/30"
                          }`}
                        >
                          {page.selected && "✓"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* OPTIONS */}

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                  <h2 className="font-bold">
                    Formato
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setFormat("jpg")
                      }
                      className={`rounded-xl border p-3 text-sm font-semibold ${
                        format === "jpg"
                          ? "border-white bg-white text-black"
                          : "border-white/10 text-zinc-500 hover:bg-white/5"
                      }`}
                    >
                      JPG
                    </button>

                    <button
                      onClick={() =>
                        setFormat("png")
                      }
                      className={`rounded-xl border p-3 text-sm font-semibold ${
                        format === "png"
                          ? "border-white bg-white text-black"
                          : "border-white/10 text-zinc-500 hover:bg-white/5"
                      }`}
                    >
                      PNG
                    </button>
                  </div>
                </div>

                {format === "jpg" && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                    <div className="flex justify-between">
                      <h2 className="font-bold">
                        Calidad JPG
                      </h2>

                      <span className="text-sm text-zinc-500">
                        {Math.round(
                          quality * 100
                        )}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.4"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(event) =>
                        setQuality(
                          Number(event.target.value)
                        )
                      }
                      className="mt-5 w-full"
                    />

                    <div className="mt-2 flex justify-between text-[10px] text-zinc-700">
                      <span>Menor tamaño</span>
                      <span>Mayor calidad</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={convertPages}
                  disabled={
                    loading ||
                    selectedCount === 0
                  }
                  className="w-full rounded-2xl bg-white py-4 font-black text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? `Convirtiendo ${progress}%`
                    : `Convertir ${selectedCount} ${
                        selectedCount === 1
                          ? "página"
                          : "páginas"
                      }`}
                </button>

                {message && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center text-sm text-zinc-500">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒{" "}
          <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          el PDF se procesa directamente en tu navegador.
          No se envía a un servidor.
        </div>
      </section>
    </main>
  );
}

function dataUrlToBlob(dataUrl: string) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";

  const binary = atob(parts[1]);

  const bytes = new Uint8Array(
    binary.length
  );

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: mime,
  });
}