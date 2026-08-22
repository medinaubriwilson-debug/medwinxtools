"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export default function QRGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [text, setText] = useState("");
  const [size, setSize] = useState(300);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    if (!text.trim()) {
      const context = canvas.getContext("2d");

      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      setGenerated(false);
      setError("");
      return;
    }

    QRCode.toCanvas(
      canvas,
      text,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (qrError) => {
        if (qrError) {
          console.error(qrError);
          setError("No se pudo generar el código QR.");
          setGenerated(false);
          return;
        }

        setError("");
        setGenerated(true);
      }
    );
  }, [text, size]);

  const downloadQR = () => {
    const canvas = canvasRef.current;

    if (!canvas || !generated) return;

    const link = document.createElement("a");

    link.download = "medwinxtools-qr.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  const clear = () => {
    setText("");
    setGenerated(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
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
            ← Volver
          </a>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-600">
            MedwinxTools / Generadores
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Generador de códigos QR
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Convierte cualquier texto, enlace o información en un código QR.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* CONFIGURATION */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <label className="mb-3 block text-sm font-medium text-zinc-400">
              Texto o enlace
            </label>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escribe aquí algo como https://google.com"
              rows={5}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-white/20"
            />

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400">
                  Tamaño
                </label>

                <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-semibold">
                  {size}px
                </span>
              </div>

              <input
                type="range"
                min="150"
                max="600"
                step="50"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={clear}
                className="flex-1 rounded-2xl border border-white/10 py-4 font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Limpiar
              </button>

              <button
                onClick={downloadQR}
                disabled={!generated}
                className="flex-1 rounded-2xl bg-white py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Descargar PNG
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* PREVIEW */}
          <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-zinc-600">
                Vista previa
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Tu código QR
              </h2>
            </div>

            <div className="flex min-h-[330px] items-center justify-center rounded-2xl border border-white/10 bg-white p-5">
              <canvas
                ref={canvasRef}
                className="max-h-full max-w-full"
              />

              {!generated && !text && (
                <div className="absolute text-center text-black/30">
                  <div className="mb-3 text-5xl">▦</div>

                  <p className="text-sm font-medium">
                    Escribe algo para generar tu QR
                  </p>
                </div>
              )}
            </div>

            {generated && (
              <p className="mt-4 text-center text-xs text-zinc-600">
                ✓ Código generado correctamente
              </p>
            )}
          </aside>
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