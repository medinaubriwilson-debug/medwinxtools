"use client";

import { ChangeEvent, DragEvent, useState } from "react";

type Format = "image/jpeg" | "image/png" | "image/webp";

const formats: {
  value: Format;
  label: string;
}[] = [
  {
    value: "image/jpeg",
    label: "JPG",
  },
  {
    value: "image/png",
    label: "PNG",
  },
  {
    value: "image/webp",
    label: "WEBP",
  },
];

export default function ConvertirImagenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [format, setFormat] =
    useState<Format>("image/jpeg");

  const [quality, setQuality] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [result, setResult] = useState<{
    blob: Blob;
    url: string;
    size: number;
  } | null>(null);

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

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    const imageUrl =
      URL.createObjectURL(selected);

    setFile(selected);
    setPreview(imageUrl);
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

  const convertImage = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const image = new Image();

      const imageUrl =
        URL.createObjectURL(file);

      await new Promise<void>(
        (resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = reject;
          image.src = imageUrl;
        }
      );

      const canvas =
        document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "No se pudo crear el canvas."
        );
      }

      /*
       * PNG puede tener transparencia.
       * JPG no soporta transparencia, por lo
       * que colocamos fondo blanco.
       */

      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      context.drawImage(
        image,
        0,
        0
      );

      const blob =
        await canvasToBlob(
          canvas,
          format,
          format === "image/png"
            ? undefined
            : quality
        );

      URL.revokeObjectURL(imageUrl);

      const url =
        URL.createObjectURL(blob);

      setResult({
        blob,
        url,
        size: blob.size,
      });

      setMessage(
        "✓ Imagen convertida correctamente."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo convertir la imagen."
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
      `${originalName}-convertida.${extension}`;

    document.body.appendChild(link);

    link.click();

    link.remove();
  };

  const reset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setFile(null);
    setPreview("");
    setResult(null);
    setMessage("");
  };

  const originalSize =
    file?.size ?? 0;

  const difference =
    result && originalSize
      ? ((result.size - originalSize) /
          originalSize) *
        100
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

      {/* CONTENT */}

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            🔄
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / Imágenes
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Convertir imagen
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Convierte tus imágenes entre JPG, PNG y
            WEBP directamente desde tu navegador.
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
              JPG, PNG, WEBP y otros formatos del
              navegador.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar imagen
            </div>

            <p className="mt-5 text-xs text-zinc-700">
              El archivo permanece en tu dispositivo.
            </p>
          </label>
        )}

        {/* TOOL */}

        {file && (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            {/* PREVIEW */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {formatBytes(file.size)} ·{" "}
                    {file.type}
                  </p>
                </div>

                <button
                  onClick={reset}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                >
                  Cambiar
                </button>
              </div>

              <div className="flex min-h-[420px] items-center justify-center bg-black/30 p-8">
                <img
                  src={preview}
                  alt={file.name}
                  className="max-h-[520px] max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
            </div>

            {/* OPTIONS */}

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Convertir a
                </h2>

                <div className="mt-4 space-y-2">
                  {formats.map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        setFormat(item.value)
                      }
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                        format === item.value
                          ? "border-white bg-white text-black"
                          : "border-white/10 text-zinc-400 hover:bg-white/5"
                      }`}
                    >
                      <span className="font-semibold">
                        {item.label}
                      </span>

                      {format === item.value && (
                        <span>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {format !== "image/png" && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex justify-between">
                    <h2 className="font-bold">
                      Calidad
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
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-5 w-full"
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-zinc-700">
                    <span>
                      Menor tamaño
                    </span>

                    <span>
                      Mayor calidad
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={convertImage}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Convirtiendo..."
                  : `Convertir a ${
                      format === "image/jpeg"
                        ? "JPG"
                        : format ===
                            "image/png"
                          ? "PNG"
                          : "WEBP"
                    }`}
              </button>

              {result && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                  <div className="p-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                      ✓
                    </div>

                    <h3 className="mt-4 font-bold">
                      Conversión terminada
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-black/20 p-3">
                        <p className="text-[10px] uppercase text-zinc-700">
                          Original
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatBytes(
                            originalSize
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-3">
                        <p className="text-[10px] uppercase text-zinc-700">
                          Resultado
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatBytes(
                            result.size
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-zinc-600">
                      {difference < 0
                        ? `${Math.abs(
                            difference
                          ).toFixed(
                            1
                          )}% menos tamaño`
                        : `${difference.toFixed(
                            1
                          )}% de diferencia`}
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
          la imagen se convierte directamente en tu
          navegador. No se sube a ningún servidor.
        </div>
      </section>
    </main>
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: Format,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
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
  });
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
    bytes / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}