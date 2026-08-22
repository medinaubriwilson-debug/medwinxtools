"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useState,
} from "react";

type Format =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export default function RedimensionarImagenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [originalWidth, setOriginalWidth] =
    useState(0);
  const [originalHeight, setOriginalHeight] =
    useState(0);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [keepRatio, setKeepRatio] =
    useState(true);

  const [format, setFormat] =
    useState<Format>("image/jpeg");

  const [quality, setQuality] =
    useState(0.85);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);

  const [message, setMessage] =
    useState("");

  const selectFile = (selected: File | null) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setMessage(
        "Selecciona una imagen válida."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (result) {
      URL.revokeObjectURL(result.url);
    }

    const imageUrl =
      URL.createObjectURL(selected);

    const image = new Image();

    image.onload = () => {
      setFile(selected);
      setPreview(imageUrl);

      setOriginalWidth(
        image.naturalWidth
      );

      setOriginalHeight(
        image.naturalHeight
      );

      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);

      setResult(null);
      setMessage("");
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);

      setMessage(
        "No se pudo leer la imagen."
      );
    };

    image.src = imageUrl;
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

  const changeWidth = (value: number) => {
    if (!value || value < 1) {
      setWidth(value);
      return;
    }

    setWidth(value);

    if (keepRatio && originalWidth > 0) {
      const ratio =
        originalHeight / originalWidth;

      setHeight(
        Math.max(
          1,
          Math.round(value * ratio)
        )
      );
    }
  };

  const changeHeight = (value: number) => {
    if (!value || value < 1) {
      setHeight(value);
      return;
    }

    setHeight(value);

    if (keepRatio && originalHeight > 0) {
      const ratio =
        originalWidth / originalHeight;

      setWidth(
        Math.max(
          1,
          Math.round(value * ratio)
        )
      );
    }
  };

  const applyPreset = (newWidth: number) => {
    changeWidth(newWidth);
  };

  const resizeImage = async () => {
    if (!file) return;

    if (width < 1 || height < 1) {
      setMessage(
        "Introduce un ancho y alto válidos."
      );
      return;
    }

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

      const canvas =
        document.createElement("canvas");

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "No se pudo crear el canvas."
        );
      }

      /*
       * Suavizado para mejorar la calidad
       * al reducir imágenes.
       */

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality =
        "high";

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
        width: Math.round(width),
        height: Math.round(height),
      });

      setMessage(
        "✓ Imagen redimensionada correctamente."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo redimensionar la imagen."
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
        : format === "image/png"
          ? "png"
          : "webp";

    const originalName =
      file.name.replace(
        /\.[^/.]+$/,
        ""
      );

    const link =
      document.createElement("a");

    link.href = result.url;

    link.download =
      `${originalName}-${result.width}x${result.height}.${extension}`;

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

    setOriginalWidth(0);
    setOriginalHeight(0);

    setWidth(0);
    setHeight(0);

    setMessage("");
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      if (result) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, []);

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

      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-5 py-14">
        {/* TITLE */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            📐
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / Imágenes
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Redimensionar imagen
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Cambia las dimensiones de una imagen
            manteniendo la proporción.
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
              📐
            </div>

            <h2 className="mt-7 text-xl font-bold">
              Selecciona una imagen
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              También puedes arrastrarla aquí.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar imagen
            </div>
          </label>
        )}

        {/* TOOL */}

        {file && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            {/* PREVIEW */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Original:{" "}
                    {originalWidth} ×{" "}
                    {originalHeight}px
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
                  className="max-h-[560px] max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
            </div>

            {/* SETTINGS */}

            <div className="space-y-5">
              {/* DIMENSIONS */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Dimensiones
                </h2>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <DimensionInput
                    label="Ancho"
                    value={width}
                    onChange={changeWidth}
                  />

                  <div className="mb-3 text-zinc-600">
                    ×
                  </div>

                  <DimensionInput
                    label="Alto"
                    value={height}
                    onChange={changeHeight}
                  />
                </div>

                <button
                  onClick={() =>
                    setKeepRatio(
                      !keepRatio
                    )
                  }
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                    keepRatio
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  <span>
                    {keepRatio
                      ? "🔒"
                      : "🔓"}
                  </span>

                  {keepRatio
                    ? "Proporción bloqueada"
                    : "Proporción libre"}
                </button>
              </div>

              {/* PRESETS */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Tamaños rápidos
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    1920,
                    1280,
                    1080,
                    800,
                    600,
                    480,
                  ].map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        applyPreset(size)
                      }
                      className="rounded-xl border border-white/10 p-3 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* FORMAT */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Formato
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <FormatButton
                    active={
                      format ===
                      "image/jpeg"
                    }
                    onClick={() =>
                      setFormat(
                        "image/jpeg"
                      )
                    }
                  >
                    JPG
                  </FormatButton>

                  <FormatButton
                    active={
                      format ===
                      "image/png"
                    }
                    onClick={() =>
                      setFormat(
                        "image/png"
                      )
                    }
                  >
                    PNG
                  </FormatButton>

                  <FormatButton
                    active={
                      format ===
                      "image/webp"
                    }
                    onClick={() =>
                      setFormat(
                        "image/webp"
                      )
                    }
                  >
                    WEBP
                  </FormatButton>
                </div>
              </div>

              {/* QUALITY */}

              {format !== "image/png" && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex justify-between">
                    <h2 className="font-bold">
                      Calidad
                    </h2>

                    <span className="text-sm text-zinc-500">
                      {Math.round(
                        quality * 100
                      )}
                      %
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
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-5 w-full"
                  />
                </div>
              )}

              {/* ACTION */}

              <button
                onClick={resizeImage}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Redimensionando..."
                  : "Redimensionar imagen"}
              </button>

              {/* RESULT */}

              {result && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                  <div className="p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      ✓
                    </div>

                    <h3 className="mt-4 font-bold">
                      Imagen lista
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      {result.width} ×{" "}
                      {result.height}px
                    </p>

                    <p className="mt-1 text-xs text-zinc-700">
                      {formatBytes(
                        result.blob.size
                      )}
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

        {/* PRIVACY */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒{" "}
          <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          la imagen se redimensiona directamente en
          tu navegador. No se sube a ningún servidor.
        </div>
      </section>
    </main>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-zinc-600">
        {label}
      </span>

      <input
        type="number"
        min="1"
        value={value || ""}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-white/30"
      />
    </label>
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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: Format,
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