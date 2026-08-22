"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

export default function ImagenesPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addImages = (files: FileList | null) => {
    if (!files) return;

    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = selected.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...newImages]);
    setMessage("");
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const image = current.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const moveLeft = (index: number) => {
    if (index === 0) return;

    setImages((current) => {
      const updated = [...current];

      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  };

  const moveRight = (index: number) => {
    if (index === images.length - 1) return;

    setImages((current) => {
      const updated = [...current];

      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  };

  const clearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setImages([]);
    setMessage("");
  };

  const createPdf = async () => {
    if (images.length === 0) {
      setMessage("Selecciona al menos una imagen.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      let pdf: jsPDF | null = null;

      for (let index = 0; index < images.length; index++) {
        const image = images[index];

        const dataUrl = await fileToDataUrl(image.file);

        const dimensions = await getImageDimensions(
          image.file
        );

        const orientation =
          dimensions.width > dimensions.height
            ? "landscape"
            : "portrait";

        const pageWidth = 210;
        const pageHeight = 297;

        if (!pdf) {
          pdf = new jsPDF({
            orientation,
            unit: "mm",
            format: "a4",
          });
        } else {
          pdf.addPage(
            "a4",
            orientation
          );
        }

        const margin = 10;

        const availableWidth =
          pageWidth - margin * 2;

        const availableHeight =
          pageHeight - margin * 2;

        const ratio = Math.min(
          availableWidth / dimensions.width,
          availableHeight / dimensions.height
        );

        const width =
          dimensions.width * ratio;

        const height =
          dimensions.height * ratio;

        const x =
          (pageWidth - width) / 2;

        const y =
          (pageHeight - height) / 2;

        pdf.addImage(
          dataUrl,
          getImageFormat(image.file),
          x,
          y,
          width,
          height,
          undefined,
          "FAST"
        );
      }

      if (!pdf) {
        throw new Error("No se pudo crear el PDF.");
      }

      pdf.save("medwinxtools-imagenes.pdf");

      setMessage(
        `✓ PDF creado correctamente con ${images.length} ${
          images.length === 1
            ? "imagen"
            : "imágenes"
        }.`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo crear el PDF."
      );
    } finally {
      setLoading(false);
    }
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

      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            🖼️
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / PDF
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Imágenes a PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Convierte varias imágenes en un único archivo PDF.
          </p>
        </div>

        {/* UPLOAD */}

        <label className="group block cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.025] p-12 text-center transition hover:border-white/25 hover:bg-white/[0.04]">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              addImages(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl transition group-hover:scale-105">
            🖼️
          </div>

          <h2 className="mt-6 text-xl font-bold">
            Selecciona tus imágenes
          </h2>

          <p className="mt-2 text-sm text-zinc-600">
            JPG, PNG, WEBP y otros formatos compatibles.
          </p>

          <div className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
            Seleccionar imágenes
          </div>

          <p className="mt-4 text-xs text-zinc-700">
            Puedes seleccionar varias a la vez.
          </p>
        </label>

        {/* IMAGES */}

        {images.length > 0 && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">
                  Imágenes seleccionadas
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {images.length}{" "}
                  {images.length === 1
                    ? "imagen"
                    : "imágenes"}
                </p>
              </div>

              <button
                onClick={clearAll}
                className="text-xs text-zinc-600 hover:text-white"
              >
                Limpiar todo
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                >
                  <div className="relative aspect-[4/3] bg-black">
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="h-full w-full object-contain"
                    />

                    <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-xs text-zinc-400">
                      {image.file.name}
                    </p>

                    <div className="mt-3 flex items-center gap-1">
                      <button
                        onClick={() =>
                          moveLeft(index)
                        }
                        disabled={index === 0}
                        className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-20"
                      >
                        ←
                      </button>

                      <button
                        onClick={() =>
                          moveRight(index)
                        }
                        disabled={
                          index === images.length - 1
                        }
                        className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-20"
                      >
                        →
                      </button>

                      <button
                        onClick={() =>
                          removeImage(image.id)
                        }
                        className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={createPdf}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Creando PDF..."
                : `Crear PDF · ${images.length} ${
                    images.length === 1
                      ? "imagen"
                      : "imágenes"
                  }`}
            </button>

            {message && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-zinc-500">
                {message}
              </div>
            )}
          </div>
        )}

        {/* PRIVACY */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-zinc-600">
          🔒{" "}
          <strong className="text-zinc-400">
            Procesamiento local:
          </strong>{" "}
          tus imágenes se procesan directamente en tu navegador.
          No necesitas subirlas a un servidor.
        </div>
      </section>
    </main>
  );
}

function fileToDataUrl(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(reader.result as string);

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function getImageDimensions(
  file: File
): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      });

      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };

    image.src = url;
  });
}

function getImageFormat(
  file: File
): "JPEG" | "PNG" {
  if (file.type === "image/png") {
    return "PNG";
  }

  return "JPEG";
}