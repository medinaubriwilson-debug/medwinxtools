"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

type SelectedFile = {
  file: File;
  id: string;
};

export default function UnirPdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf"
    );

    const newFiles = pdfFiles.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    }));

    setFiles((current) => [...current, ...newFiles]);
    setMessage("");
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;

    setFiles((current) => {
      const updated = [...current];
      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];
      return updated;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;

    setFiles((current) => {
      const updated = [...current];
      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];
      return updated;
    });
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setMessage("Selecciona al menos 2 archivos PDF.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();

        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedBytes = await mergedPdf.save();

     const blob = new Blob(
  [new Uint8Array(mergedBytes)],
  {
    type: "application/pdf",
  }
);

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "medwinxtools-documento-unido.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage("✓ PDF creado correctamente.");
    } catch (error) {
      console.error(error);
      setMessage(
        "No se pudieron unir los archivos. Comprueba que sean PDF válidos."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setMessage("");
  };

  const totalSize = files.reduce(
    (total, item) => total + item.file.size,
    0
  );

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
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Unir PDF
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Combina varios archivos PDF en un solo documento.
          </p>
        </div>

        {/* UPLOAD */}
        <label className="group block cursor-pointer rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center transition hover:border-white/30 hover:bg-white/[0.04]">
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-3xl">
            📄
          </div>

          <h2 className="mt-5 text-xl font-bold">
            Selecciona tus archivos PDF
          </h2>

          <p className="mt-2 text-sm text-zinc-600">
            Puedes seleccionar varios archivos al mismo tiempo.
          </p>

          <div className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">
            Seleccionar PDF
          </div>
        </label>

        {/* FILE LIST */}
        {files.length > 0 && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">
                  Archivos seleccionados
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {files.length} archivos ·{" "}
                  {formatBytes(totalSize)}
                </p>
              </div>

              <button
                onClick={clearAll}
                className="text-xs text-zinc-600 transition hover:text-white"
              >
                Limpiar todo
              </button>
            </div>

            <div className="space-y-3">
              {files.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    📄
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.file.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="rounded-lg px-2 py-2 text-zinc-600 hover:bg-white/5 hover:text-white disabled:opacity-20"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="rounded-lg px-2 py-2 text-zinc-600 hover:bg-white/5 hover:text-white disabled:opacity-20"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg px-2 py-2 text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MERGE */}
            <button
              onClick={mergePDFs}
              disabled={loading || files.length < 2}
              className="mt-6 w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading
                ? "Uniendo PDF..."
                : "Unir PDF"}
            </button>

            {message && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-zinc-400">
                {message}
              </div>
            )}
          </div>
        )}

        {/* PRIVACY */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex gap-4">
            <div className="text-2xl">🔒</div>

            <div>
              <h2 className="font-semibold">
                Tus archivos permanecen en tu dispositivo
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                El procesamiento se realiza directamente en tu navegador.
                Los archivos no necesitan ser enviados a un servidor para
                unirlos.
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