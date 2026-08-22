"use client";

import { useState } from "react";
import { jsPDF } from "jspdf"; 

type CompressionLevel = "quality" | "recommended" | "maximum";

const settings = {
  quality: {
    scale: 2,
    quality: 0.9,
  },
  recommended: {
    scale: 1.5,
    quality: 0.72,
  },
  maximum: {
    scale: 1,
    quality: 0.5,
  },
};

export default function ComprimirPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] =
    useState<CompressionLevel>("recommended");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState<{
    blob: Blob;
    size: number;
    url: string;
  } | null>(null);

  const [message, setMessage] = useState("");

  const selectFile = (selected: File | null) => {
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Selecciona un archivo PDF válido.");
      return;
    }

    setFile(selected);
    setResult(null);
    setMessage("");
    setProgress(0);
  };

  const compressPdf = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);
      setResult(null);

      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const totalPages = pdf.numPages;

      let outputPdf: jsPDF | null = null;

      const config = settings[level];

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: config.scale,
        });

        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("No se pudo crear el canvas.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

     await page.render({
  canvas: canvas,
  viewport: viewport,
}).promise;

        const imageData = canvas.toDataURL(
          "image/jpeg",
          config.quality
        );

        const widthMm = viewport.width * 0.264583;
        const heightMm = viewport.height * 0.264583;

        if (!outputPdf) {
          outputPdf = new jsPDF({
            orientation:
              widthMm > heightMm ? "landscape" : "portrait",
            unit: "mm",
            format: [widthMm, heightMm],
            compress: true,
          });
        } else {
          outputPdf.addPage(
            [widthMm, heightMm],
            widthMm > heightMm
              ? "landscape"
              : "portrait"
          );
        }

        outputPdf.addImage(
          imageData,
          "JPEG",
          0,
          0,
          widthMm,
          heightMm,
          undefined,
          "FAST"
        );

        canvas.width = 1;
        canvas.height = 1;

        setProgress(
          Math.round((pageNumber / totalPages) * 100)
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 0)
        );
      }

      if (!outputPdf) {
        throw new Error("No se pudo crear el PDF.");
      }

      const blob = outputPdf.output("blob");

      const url = URL.createObjectURL(blob);

      setResult({
        blob,
        size: blob.size,
        url,
      });

      if (blob.size < file.size) {
        const reduction =
          ((file.size - blob.size) / file.size) * 100;

        setMessage(
          `PDF comprimido correctamente. Reducción: ${reduction.toFixed(
            1
          )}%`
        );
      } else {
        setMessage(
          "El PDF fue procesado, pero su tamaño no disminuyó. Prueba con Máxima compresión."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo comprimir el PDF. Comprueba que el archivo sea válido."
      );
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;

    const link = document.createElement("a");

    link.href = result.url;
    link.download = "medwinxtools-comprimido.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const reset = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setFile(null);
    setResult(null);
    setMessage("");
    setProgress(0);
  };

  const reduction =
    file && result
      ? Math.max(
          0,
          ((file.size - result.size) / file.size) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
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

      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            📦
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Comprimir PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Reduce el tamaño de tus documentos directamente
            desde tu navegador.
          </p>
        </div>

        {!file ? (
          <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.025] p-14 text-center transition hover:border-white/25 hover:bg-white/[0.04]">
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) =>
                selectFile(e.target.files?.[0] ?? null)
              }
            />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl">
              📄
            </div>

            <h2 className="mt-7 text-xl font-bold">
              Selecciona tu PDF
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              El archivo se procesa localmente.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar archivo
            </div>
          </label>
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl">
                  📄
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Tamaño original:{" "}
                    {formatBytes(file.size)}
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

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <h2 className="font-bold">
                Nivel de compresión
              </h2>

              <div className="mt-5 space-y-3">
                <Option
                  selected={level === "quality"}
                  onClick={() => setLevel("quality")}
                  title="Máxima calidad"
                  text="Menor compresión, mejor calidad visual."
                />

                <Option
                  selected={level === "recommended"}
                  onClick={() =>
                    setLevel("recommended")
                  }
                  title="Recomendada"
                  text="Buen equilibrio entre calidad y tamaño."
                  recommended
                />

                <Option
                  selected={level === "maximum"}
                  onClick={() => setLevel("maximum")}
                  title="Máxima compresión"
                  text="Reduce más el tamaño del archivo."
                />
              </div>
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex justify-between text-sm">
                  <span>
                    Comprimiendo PDF...
                  </span>

                  <span className="text-zinc-500">
                    {progress}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!result && !loading && (
              <button
                onClick={compressPdf}
                className="w-full rounded-2xl bg-white py-4 font-black text-black hover:bg-zinc-200"
              >
                Comprimir PDF
              </button>
            )}

            {result && (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-black">
                    ✓
                  </div>

                  <h2 className="mt-5 text-2xl font-black">
                    PDF comprimido
                  </h2>

                  <p className="mt-2 text-zinc-600">
                    Reducción de{" "}
                    {reduction.toFixed(1)}%
                  </p>
                </div>

                <div className="grid grid-cols-3 border-y border-white/10">
                  <Stat
                    title="Original"
                    value={formatBytes(file.size)}
                  />

                  <Stat
                    title="Comprimido"
                    value={formatBytes(result.size)}
                  />

                  <Stat
                    title="Reducción"
                    value={`${reduction.toFixed(1)}%`}
                  />
                </div>

                <div className="p-6">
                  <button
                    onClick={download}
                    className="w-full rounded-2xl bg-white py-4 font-black text-black hover:bg-zinc-200"
                  >
                    ↓ Descargar PDF
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center text-sm text-zinc-500">
                {message}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒 <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          el PDF se procesa directamente en tu navegador.
          No se envía a un servidor.
        </div>
      </section>
    </main>
  );
}

function Option({
  selected,
  onClick,
  title,
  text,
  recommended,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  text: string;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-white/30 bg-white/[0.07]"
          : "border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            selected
              ? "border-white"
              : "border-white/20"
          }`}
        >
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {title}
            </span>

            {recommended && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-black">
                RECOMENDADA
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-600">
            {text}
          </p>
        </div>
      </div>
    </button>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="p-5 text-center">
      <p className="text-[10px] uppercase tracking-widest text-zinc-700">
        {title}
      </p>

      <p className="mt-2 font-black">
        {value}
      </p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
}