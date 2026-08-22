"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Shape =
  | "rectangle"
  | "rounded"
  | "circle"
  | "oval"
  | "diamond"
  | "heart"
  | "star"
  | "hexagon"
  | "octagon";

type Format =
  | "image/png"
  | "image/jpeg"
  | "image/webp";

const shapes: {
  id: Shape;
  name: string;
  icon: string;
}[] = [
  {
    id: "rectangle",
    name: "Rectángulo",
    icon: "▭",
  },
  {
    id: "rounded",
    name: "Redondeado",
    icon: "▢",
  },
  {
    id: "circle",
    name: "Círculo",
    icon: "●",
  },
  {
    id: "oval",
    name: "Óvalo",
    icon: "⬭",
  },
  {
    id: "diamond",
    name: "Rombo",
    icon: "◆",
  },
  {
    id: "heart",
    name: "Corazón",
    icon: "♥",
  },
  {
    id: "star",
    name: "Estrella",
    icon: "★",
  },
  {
    id: "hexagon",
    name: "Hexágono",
    icon: "⬡",
  },
  {
    id: "octagon",
    name: "Octágono",
    icon: "🛑",
  },
];

export default function RecortarImagenPage() {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [image, setImage] =
    useState<HTMLImageElement | null>(null);

  const [preview, setPreview] =
    useState("");

  const [shape, setShape] =
    useState<Shape>("rounded");

  const [borderRadius, setBorderRadius] =
    useState(40);

  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  const [cropWidth, setCropWidth] =
    useState(500);

  const [cropHeight, setCropHeight] =
    useState(500);

  const [keepRatio, setKeepRatio] =
    useState(false);

  const [format, setFormat] =
    useState<Format>("image/png");

  const [quality, setQuality] =
    useState(0.9);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<{
      url: string;
      blob: Blob;
      width: number;
      height: number;
    } | null>(null);

  const [message, setMessage] =
    useState("");

  const selectFile = (
    selected: File | null
  ) => {
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

    const url =
      URL.createObjectURL(selected);

    const img = new Image();

    img.onload = () => {
      setFile(selected);
      setImage(img);
      setPreview(url);

      const size = Math.min(
        img.naturalWidth,
        img.naturalHeight
      );

      setCropWidth(size);
      setCropHeight(size);

      setCropX(
        Math.max(
          0,
          (img.naturalWidth - size) / 2
        )
      );

      setCropY(
        Math.max(
          0,
          (img.naturalHeight - size) / 2
        )
      );

      setResult(null);
      setMessage("");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);

      setMessage(
        "No se pudo cargar la imagen."
      );
    };

    img.src = url;
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

  const changeWidth = (
    value: number
  ) => {
    const safe = Math.max(
      1,
      Math.min(
        value,
        image?.naturalWidth ?? value
      )
    );

    setCropWidth(safe);

    if (keepRatio) {
      const ratio =
        cropHeight / cropWidth;

      setCropHeight(
        Math.min(
          image?.naturalHeight ?? safe,
          Math.round(safe * ratio)
        )
      );
    }
  };

  const changeHeight = (
    value: number
  ) => {
    const safe = Math.max(
      1,
      Math.min(
        value,
        image?.naturalHeight ?? value
      )
    );

    setCropHeight(safe);

    if (keepRatio) {
      const ratio =
        cropWidth / cropHeight;

      setCropWidth(
        Math.min(
          image?.naturalWidth ?? safe,
          Math.round(safe * ratio)
        )
      );
    }
  };

  const centerCrop = () => {
    if (!image) return;

    setCropX(
      Math.max(
        0,
        (image.naturalWidth -
          cropWidth) /
          2
      )
    );

    setCropY(
      Math.max(
        0,
        (image.naturalHeight -
          cropHeight) /
          2
      )
    );
  };

const createShapePath = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentShape: Shape
) => {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.beginPath();

  switch (currentShape) {
    case "rectangle":
      ctx.rect(0, 0, width, height);
      break;

    case "rounded": {
      const radius = Math.min(
        borderRadius,
        width / 2,
        height / 2
      );

      roundedRectangle(
        ctx,
        0,
        0,
        width,
        height,
        radius
      );
      break;
    }

    case "circle": {
      const radius = Math.min(width, height) / 2;

      ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
      );

      break;
    }

    case "oval":
      ctx.ellipse(
        centerX,
        centerY,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2
      );
      break;

    case "diamond":
      ctx.moveTo(centerX, 0);
      ctx.lineTo(width, centerY);
      ctx.lineTo(centerX, height);
      ctx.lineTo(0, centerY);
      ctx.closePath();
      break;

    case "heart": {
      /*
       * Corazón simétrico.
       */

      ctx.moveTo(centerX, height * 0.90);

      // Lado derecho inferior → lateral
      ctx.bezierCurveTo(
        width * 0.82,
        height * 0.70,
        width,
        height * 0.52,
        width,
        height * 0.32
      );

      // Parte superior derecha
      ctx.bezierCurveTo(
        width,
        height * 0.12,
        width * 0.72,
        height * 0.02,
        centerX,
        height * 0.25
      );

      // Bajada al centro
      ctx.bezierCurveTo(
        centerX,
        height * 0.08,
        centerX,
        height * 0.08,
        centerX,
        height * 0.25
      );

      // Parte superior izquierda
      ctx.bezierCurveTo(
        width * 0.28,
        height * 0.02,
        0,
        height * 0.12,
        0,
        height * 0.32
      );

      // Lado izquierdo inferior
      ctx.bezierCurveTo(
        0,
        height * 0.52,
        width * 0.18,
        height * 0.70,
        centerX,
        height * 0.90
      );

      ctx.closePath();
      break;
    }

    case "star":
      drawStar(
        ctx,
        centerX,
        centerY,
        Math.min(width, height) / 2,
        Math.min(width, height) * 0.22
      );
      break;

    case "hexagon":
      drawRegularPolygon(
        ctx,
        centerX,
        centerY,
        Math.min(width, height) / 2,
        6,
        -Math.PI / 2
      );
      break;

    case "octagon":
      drawRegularPolygon(
        ctx,
        centerX,
        centerY,
        Math.min(width, height) / 2,
        8,
        Math.PI / 8
      );
      break;
  }

  ctx.closePath();
};

function roundedRectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(
    radius,
    width / 2,
    height / 2
  );

  ctx.moveTo(
    x + r,
    y
  );

  ctx.lineTo(
    x + width - r,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  );

  ctx.lineTo(
    x + width,
    y + height - r
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  );

  ctx.lineTo(
    x + r,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}

function drawRegularPolygon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  sides: number,
  rotation: number
) {
  ctx.beginPath();

  for (
    let i = 0;
    i < sides;
    i++
  ) {
    const angle =
      rotation +
      (i * Math.PI * 2) / sides;

    const x =
      centerX +
      Math.cos(angle) * radius;

    const y =
      centerY +
      Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
}
function drawStar(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number
) {
  ctx.beginPath();

  const points = 10;

  for (
    let i = 0;
    i < points;
    i++
  ) {
    const radius =
      i % 2 === 0
        ? outerRadius
        : innerRadius;

    const angle =
      -Math.PI / 2 +
      (i * Math.PI * 2) / points;

    const x =
      centerX +
      Math.cos(angle) * radius;

    const y =
      centerY +
      Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
}
  const generateResult = async () => {
    if (!image) return;

    if (
      cropWidth < 1 ||
      cropHeight < 1
    ) {
      setMessage(
        "El tamaño del recorte no es válido."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const canvas =
        document.createElement("canvas");

      canvas.width =
        Math.round(cropWidth);

      canvas.height =
        Math.round(cropHeight);

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "No se pudo crear el canvas."
        );
      }

      /*
       * La forma funciona como máscara.
       */

      createShapePath(
        ctx,
        canvas.width,
        canvas.height,
        shape
      );

      ctx.save();
      ctx.clip();

      /*
       * Para JPG ponemos fondo blanco.
       * PNG y WEBP mantienen transparencia.
       */

      if (
        format === "image/jpeg"
      ) {
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.restore();

      const blob =
        await canvasToBlob(
          canvas,
          format,
          format === "image/png"
            ? undefined
            : quality
        );

      const url =
        URL.createObjectURL(blob);

      setResult({
        url,
        blob,
        width: canvas.width,
        height: canvas.height,
      });

      setMessage(
        "✓ Imagen editada correctamente."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo generar la imagen."
      );
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result || !file) return;

    const extension =
      format === "image/png"
        ? "png"
        : format === "image/jpeg"
          ? "jpg"
          : "webp";

    const name =
      file.name.replace(
        /\.[^/.]+$/,
        ""
      );

    const link =
      document.createElement("a");

    link.href = result.url;

    link.download =
      `${name}-${shape}.${extension}`;

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
    setImage(null);
    setPreview("");
    setResult(null);

    setCropX(0);
    setCropY(0);
    setCropWidth(500);
    setCropHeight(500);

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

 useEffect(() => {
  if (!image || !canvasRef.current) {
    return;
  }

  const canvas = canvasRef.current;

  const width = Math.max(
    1,
    Math.round(cropWidth)
  );

  const height = Math.max(
    1,
    Math.round(cropHeight)
  );

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;

  // Limpiar completamente
  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  // Crear la forma
  createShapePath(
    ctx,
    width,
    height,
    shape
  );

  // Guardar máscara
  ctx.save();

  ctx.clip();

  // Fondo para JPG
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  // Dibujar imagen
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height
  );

  // Salir de la máscara
  ctx.restore();

}, [
  image,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  shape,
  borderRadius,
  format,
]);

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

      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
            ✂️
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
            MedwinxTools / Editor
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Recortar y dar forma
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
            Recorta imágenes y conviértelas en
            círculos, corazones, estrellas,
            rombos y muchas otras formas.
          </p>
        </div>

        {/* UPLOAD */}

        {!file && (
          <label
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            className="group block cursor-pointer rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.025] p-16 text-center hover:border-white/25 hover:bg-white/[0.04]"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInput}
            />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl">
              ✂️
            </div>

            <h2 className="mt-7 text-xl font-bold">
              Selecciona una imagen
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              JPG, PNG, WEBP y otros formatos.
            </p>

            <div className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-black">
              Seleccionar imagen
            </div>
          </label>
        )}

        {file && image && (
          <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
            {/* PREVIEW */}

            {/* PREVIEW EN TIEMPO REAL */}

<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
  <div className="border-b border-white/10 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold">
          Vista previa
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          El resultado se actualiza automáticamente
        </p>
      </div>

      <button
        onClick={reset}
        className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
      >
        Cambiar
      </button>
    </div>
  </div>

  <div
    className="
      flex min-h-[620px]
      items-center
      justify-center
      overflow-hidden
      bg-[linear-gradient(45deg,#111_25%,#181818_25%,#181818_50%,#111_50%,#111_75%,#181818_75%)]
      bg-[length:24px_24px]
      p-10
    "
  >
    <div className="relative flex max-h-[540px] max-w-full items-center justify-center">
      <canvas
   ref={canvasRef}
  className="max-h-[540px] max-w-full shadow-2xl"
  />
    </div>
  </div>

  <div className="grid grid-cols-3 border-t border-white/10">
    <div className="border-r border-white/10 p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-700">
        Original
      </p>

      <p className="mt-1 text-sm font-bold">
        {image.naturalWidth} ×{" "}
        {image.naturalHeight}
      </p>
    </div>

    <div className="border-r border-white/10 p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-700">
        Recorte
      </p>

      <p className="mt-1 text-sm font-bold">
        {Math.round(cropWidth)} ×{" "}
        {Math.round(cropHeight)}
      </p>
    </div>

    <div className="p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-700">
        Forma
      </p>

      <p className="mt-1 text-sm font-bold capitalize">
        {
          shapes.find(
            (item) =>
              item.id === shape
          )?.name
        }
      </p>
    </div>
  </div>
</div>

            {/* CONTROLS */}

            <div className="space-y-5">
              {/* SHAPES */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Forma
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {shapes.map(
                    (item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setShape(
                            item.id
                          )
                        }
                        className={`rounded-xl border p-3 transition ${
                          shape === item.id
                            ? "border-white bg-white text-black"
                            : "border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="text-xl">
                          {item.icon}
                        </div>

                        <div className="mt-1 text-[10px] font-bold">
                          {item.name}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* BORDER RADIUS */}

              {shape === "rounded" && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex justify-between">
                    <h2 className="font-bold">
                      Bordes redondeados
                    </h2>

                    <span className="text-sm text-zinc-500">
                      {borderRadius}px
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.min(
                      cropWidth,
                      cropHeight
                    ) / 2}
                    value={borderRadius}
                    onChange={(event) =>
                      setBorderRadius(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="mt-5 w-full"
                  />
                </div>
              )}

              {/* DIMENSIONS */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">
                    Recorte
                  </h2>

                  <button
                    onClick={centerCrop}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Centrar
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <NumberInput
                    label="Ancho"
                    value={cropWidth}
                    onChange={
                      changeWidth
                    }
                  />

                  <span className="mb-3 text-zinc-700">
                    ×
                  </span>

                  <NumberInput
                    label="Alto"
                    value={cropHeight}
                    onChange={
                      changeHeight
                    }
                  />
                </div>

                <button
                  onClick={() =>
                    setKeepRatio(
                      !keepRatio
                    )
                  }
                  className={`mt-5 w-full rounded-xl border p-3 text-xs font-bold ${
                    keepRatio
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-zinc-500"
                  }`}
                >
                  {keepRatio
                    ? "🔒 Proporción bloqueada"
                    : "🔓 Proporción libre"}
                </button>
              </div>

              {/* FORMAT */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <h2 className="font-bold">
                  Formato de salida
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
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

                {format ===
                  "image/png" && (
                  <p className="mt-3 text-xs text-zinc-600">
                    PNG conserva la transparencia
                    alrededor de la forma.
                  </p>
                )}
              </div>

              {/* QUALITY */}

              {format !==
                "image/png" && (
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
                    onChange={(
                      event
                    ) =>
                      setQuality(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="mt-5 w-full"
                  />
                </div>
              )}

              {/* GENERATE */}

              <button
                onClick={
                  generateResult
                }
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-black text-black hover:bg-zinc-200 disabled:opacity-40"
              >
                {loading
                  ? "Generando..."
                  : "✂️ Crear imagen"}
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

                    <div className="mt-5 flex justify-center rounded-xl bg-[linear-gradient(45deg,#111_25%,#181818_25%,#181818_50%,#111_50%,#111_75%,#181818_75%)] bg-[length:20px_20px] p-4">
                      <img
                        src={result.url}
                        alt="Resultado"
                        className="max-h-48 max-w-full object-contain"
                      />
                    </div>
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
          la imagen se procesa directamente en tu
          navegador. No se sube a ningún servidor.
        </div>
      </section>
    </main>
  );
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number
) {
  for (let i = 0; i < sides; i++) {
    const angle =
      rotation +
      (i * Math.PI * 2) / sides;

    const x =
      cx + Math.cos(angle) * radius;

    const y =
      cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs text-zinc-600">
        {label}
      </span>

      <input
        type="number"
        min="1"
        value={value}
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