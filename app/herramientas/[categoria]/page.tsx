import { notFound } from "next/navigation";
import { tools } from "@/lib/tools";

const categoryMap: Record<string, string> = {
  pdf: "PDF",
  imagenes: "Imágenes",
  texto: "Texto",
  calculadoras: "Calculadoras",
  programacion: "Programación",
  generadores: "Generadores",
};

export function generateStaticParams() {
  return Object.keys(categoryMap).map((categoria) => ({
    categoria,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const categoryName = categoryMap[categoria.toLowerCase()];

  if (!categoryName) {
    notFound();
  }

  const categoryTools = tools.filter(
    (tool) => tool.category === categoryName
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#09090b]/90">
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
            ← Todas las herramientas
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-16">
        <p className="mb-3 text-sm uppercase tracking-widest text-zinc-600">
          Categoría
        </p>

        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          Herramientas de {categoryName}
        </h1>

        <p className="mt-5 max-w-2xl text-zinc-500">
          Explora nuestras herramientas de {categoryName.toLowerCase()}.
          Todas están diseñadas para ser rápidas, sencillas y fáciles de usar.
        </p>
      </section>

      {/* TOOLS */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        {categoryTools.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-24 text-center">
            <div className="text-5xl">🛠️</div>

            <h2 className="mt-5 text-2xl font-bold">
              Estamos preparando estas herramientas
            </h2>

            <p className="mt-3 text-zinc-600">
              Pronto encontrarás nuevas herramientas en esta categoría.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.available ? tool.href : "#"}
                className={`group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition ${
                  tool.available
                    ? "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                    : "cursor-default opacity-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
                    {tool.icon}
                  </div>

                  <span className="text-zinc-700">
                    {tool.available ? "↗" : "—"}
                  </span>
                </div>

                <h2 className="mt-6 font-semibold">
                  {tool.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {tool.description}
                </p>

                <div className="mt-5 text-xs text-zinc-700">
                  {tool.available
                    ? "Disponible"
                    : "Próximamente"}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-zinc-700">
          © 2026 MedwinxTools
        </div>
      </footer>
    </main>
  );
}