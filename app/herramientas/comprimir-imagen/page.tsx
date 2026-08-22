"use client";

import { ChangeEvent, DragEvent, useState } from "react";

type OutputFormat = "image/jpeg" | "image/webp" | "image/png";

export default function ComprimirImagenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] =
    useState<OutputFormat>("image/webp");

  const [maxWidth, setMaxWidth] = useState(0);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);

  const [message, setMessage] = useState("");

  const selectFile = (selected: File | null) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setMessage("Selecciona una imagen válida.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (result) {
      URL.revokeObjectURL(result.url);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setMessage("");
  };

  const handleInput = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    selectFile(
      event.target.files?.[0] ?? null
    );

    event.target.value = "";
  };

  const handleDrop = (
    event: DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();

    selectFile(
      event.dataTransfer.files?.[0] ?? null
    );
  };

  const compressImage = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const image = new Image();

      const sourceUrl =
        URL.createObjectURL(file);

      await new Promise<void>(
        (resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = reject;
          image.src = sourceUrl;
        }
      );

      const originalWidth =
        image.naturalWidth;

      const originalHeight =
        image.naturalHeight;

      let width = originalWidth;
      let height = originalHeight;

      /*
       * Redimensionamiento opcional.
       */

      if (
        maxWidth > 0 &&
        originalWidth > maxWidth
      ) {
        const ratio =
          maxWidth / originalWidth;

        width = Math.round(
          originalWidth * ratio
        );

        height = Math.round(
          originalHeight * ratio
        );
      }

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "No se pudo crear el canvas."
        );
      }

      /*
       * JPG no soporta transparencia.
       */

      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";

        context.fillRect(
          0,
          0,
          width,
          height
        );
      }

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      const blob =
        await canvasToBlob(
          canvas,
          format,
          format === "image/png"
            ? undefined
            : quality
        );

      URL.revokeObjectURL(sourceUrl);

      const url =
        URL.createObjectURL(blob);

      setResult({
        url,
        blob,
        width,
        height,
      });

      setMessage(
        "✓ Imagen comprimida correctamente."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo comprimir la imagen."
      );
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result || !file) return;

    const extension =
      format === "image/jpeg"
        ? "jpg"
        : format === "image/webp"
          ? "webp"
          : "png";

    const originalName =
      file.name.replace(
        /\.[^/.]+$/,
        ""
      );

    const link =
      document.createElement("a");

    link.href = result.url;

    link.download =
      `${originalName}-comprimida.${extension}`;

    document.body.appendChild(link);

    link.click();

    link.remove();
  };

  const reset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (result) {
      URL.revokeObjectURL(result.url);
    }

    setFile(null);
    setPreview("");
    setResult(null);
    setMessage("");
  };

  const savedPercent =
    file && result
      ? Math.max(
          0,
          ((file.size - result.blob.size) /
            file.size) *
            100
        )
      : 0;

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

      <section className="mx-auto max-w-6xl px-5 py-14">
        {/* TITLE */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            🗜️
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / Imágenes
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Comprimir imagen
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Reduce el tamaño de tus imágenes manteniendo
            una buena calidad visual.
          </p>
        </div>

        {/* UPLOAD */}

        {!file && (
          <label
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            className="group block cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.025] p-14 text-center transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInput}
            />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl transition group-hover:scale-105">
              🖼️
            </div>

            <h2 className="mt-7 text-xl font-bold">
              Arrastra una imagen aquí
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              JPG, PNG, WEBP y otros formatos.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar imagen
            </div>
          </label>
        )}

        {/* TOOL */}

        {file && (
          <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
            {/* IMAGE */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Original ·{" "}
                    {formatBytes(file.size)}
                  </p>
                </div>

                <button
                  onClick={reset}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                >
                  Cambiar
                </button>
              </div>

              <div className="flex min-h-[450px] items-center justify-center bg-black/30 p-8">
                <img
                  src={preview}
                  alt={file.name}
                  className="max-h-[550px] max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
            </div>

            {/* OPTIONS */}

            <div className="space-y-5">
              {/* FORMAT */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Formato
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <FormatButton
                    active={
                      format === "image/webp"
                    }
                    onClick={() =>
                      setFormat("image/webp")
                    }
                  >
                    WEBP
                  </FormatButton>

                  <FormatButton
                    active={
                      format === "image/jpeg"
                    }
                    onClick={() =>
                      setFormat("image/jpeg")
                    }
                  >
                    JPG
                  </FormatButton>

                  <FormatButton
                    active={
                      format === "image/png"
                    }
                    onClick={() =>
                      setFormat("image/png")
                    }
                  >
                    PNG
                  </FormatButton>
                </div>
              </div>

              {/* QUALITY */}

              {format !== "image/png" && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold">
                      Calidad
                    </h2>

                    <span className="text-sm font-bold text-zinc-500">
                      {Math.round(
                        quality * 100
                      )}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(event) =>
                      setQuality(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-5 w-full"
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-zinc-700">
                    <span>
                      Más compresión
                    </span>

                    <span>
                      Mejor calidad
                    </span>
                  </div>
                </div>
              )}

              {/* WIDTH */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Ancho máximo
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  0 = mantener tamaño original
                </p>

                <div className="mt-4 flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={
                      maxWidth === 0
                        ? ""
                        : maxWidth
                    }
                    onChange={(event) =>
                      setMaxWidth(
                        Number(
                          event.target.value
                        ) || 0
                      )
                    }
                    placeholder="Ej. 1920"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-white/30"
                  />

                  <span className="flex items-center text-xs text-zinc-600">
                    px
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {[1920, 1280, 800].map(
                    (size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setMaxWidth(size)
                        }
                        className="flex-1 rounded-lg border border-white/10 py-2 text-[10px] text-zinc-500 hover:bg-white/5 hover:text-white"
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* COMPRESS */}

              <button
                onClick={compressImage}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Comprimiendo..."
                  : "Comprimir imagen"}
              </button>

              {/* RESULT */}

              {result && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                  <div className="p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      ✓
                    </div>

                    <h3 className="mt-4 font-bold">
                      Compresión terminada
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <SizeBox
                        label="Original"
                        size={file.size}
                      />

                      <SizeBox
                        label="Comprimida"
                        size={
                          result.blob.size
                        }
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-white/[0.04] p-4">
                      <p className="text-xs text-zinc-600">
                        Ahorro
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {savedPercent.toFixed(
                          1
                        )}
                        %
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-700">
                        {formatBytes(
                          Math.max(
                            0,
                            file.size -
                              result.blob
                                .size
                          )
                        )}{" "}
                        menos
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-zinc-600">
                      {result.width} ×{" "}
                      {result.height}px
                    </p>
                  </div>

                  <div className="border-t border-white/10 p-4">
                    <button
                      onClick={download}
                      className="w-full rounded-xl bg-white py-3 text-sm font-black text-black hover:bg-zinc-200"
                    >
                      ↓ Descargar imagen
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
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒{" "}
          <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          la imagen nunca se sube a un servidor. La
          compresión ocurre directamente en tu navegador.
        </div>
      </section>
    </main>
  );
}

function FormatButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-xs font-bold transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SizeBox({
  label,
  size,
}: {
  label: string;
  size: number;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <p className="text-[10px] uppercase text-zinc-700">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {formatBytes(size)}
      </p>
    </div>
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OutputFormat,
  quality?: number
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                "No se pudo generar la imagen."
              )
            );
          }
        },
        type,
        quality
      );
    }
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(1024)
    ),
    units.length - 1
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}
