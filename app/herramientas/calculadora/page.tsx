"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
expression: string;
result: string;
};

export default function CalculatorPage() {
const [display, setDisplay] = useState("0");
const [expression, setExpression] = useState("");
const [history, setHistory] = useState<HistoryItem[]>([]);

const append = (value: string) => {
setDisplay((current) => {
if (current === "0" && value !== ".") {
return value;
}

  return current + value;
});

setExpression((current) => current + value);

};

const clear = () => {
setDisplay("0");
setExpression("");
};

const backspace = () => {
setDisplay((current) => {
if (current.length <= 1) {
return "0";
}

  return current.slice(0, -1);
});

setExpression((current) => current.slice(0, -1));

};

const calculate = () => {
try {
if (!expression.trim()) return;

  const sanitized = expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/%/g, "/100");

  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
    throw new Error("Expresión inválida");
  }

  const result = Function(`"use strict"; return (${sanitized})`)();

  if (!Number.isFinite(result)) {
    throw new Error("Resultado inválido");
  }

  const formatted = Number(result).toLocaleString("en-US", {
    maximumFractionDigits: 12,
  });

  setHistory((current) => [
    {
      expression,
      result: formatted,
    },
    ...current,
  ].slice(0, 10));

  setDisplay(formatted);
  setExpression(String(result));
} catch {
  setDisplay("Error");
  setExpression("");
}

};

const handleKeyDown = (event: KeyboardEvent) => {
const key = event.key;

if (/^[0-9.]$/.test(key)) {
  append(key);
}

if (["+", "-", "*", "/", "(", ")"].includes(key)) {
  const symbol = key === "*" ? "×" : key === "/" ? "÷" : key;
  append(symbol);
}

if (key === "%") {
  append("%");
}

if (key === "Enter" || key === "=") {
  calculate();
}

if (key === "Backspace") {
  backspace();
}

if (key === "Escape") {
  clear();
}

};

useEffect(() => {
window.addEventListener("keydown", handleKeyDown);

return () => {
  window.removeEventListener("keydown", handleKeyDown);
};

});

const buttons = [
["AC", "⌫", "%", "÷"],
["7", "8", "9", "×"],
["4", "5", "6", "-"],
["1", "2", "3", "+"],
["(", "0", ".", ")"],
];

return (
<main className="min-h-screen bg-[#09090b] text-white">
{/* HEADER */}
<header className="border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">
<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
<a href="/" className="flex items-center gap-3 transition hover:opacity-80" >
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
  <section className="mx-auto max-w-6xl px-5 py-12">
    <div className="mb-10">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-600">
        MedwinxTools
      </p>

      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Calculadora
      </h1>

      <p className="mt-3 max-w-2xl text-zinc-500">
        Calculadora profesional para realizar operaciones matemáticas
        rápidas directamente desde tu navegador.
      </p>
    </div>

    <div className="grid gap-8 lg:grid-cols-[minmax(0,520px)_1fr]">
      {/* CALCULATOR */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 shadow-2xl shadow-black/30 sm:p-6">
        {/* DISPLAY */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-black/40 p-5 text-right">
          <div className="mb-2 min-h-6 overflow-hidden text-sm text-zinc-600">
            {expression || " "}
          </div>

          <div className="min-h-16 overflow-x-auto text-4xl font-semibold tracking-tight text-white">
            {display}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-4 gap-3">
          {buttons.flat().map((button, index) => {
            const isOperator = ["÷", "×", "-", "+"].includes(button);
            const isAction = ["AC", "⌫", "%"].includes(button);

            return (
              <button
                key={`${button}-${index}`}
                onClick={() => {
                  if (button === "AC") {
                    clear();
                  } else if (button === "⌫") {
                    backspace();
                  } else if (button === "=") {
                    calculate();
                  } else {
                    append(button);
                  }
                }}
                className={`h-16 rounded-2xl border text-lg font-semibold transition active:scale-95 ${
                  isOperator
                    ? "border-white/10 bg-white text-black hover:bg-zinc-200"
                    : isAction
                      ? "border-white/10 bg-white/10 text-zinc-300 hover:bg-white/15"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09]"
                }`}
              >
                {button}
              </button>
            );
          })}

          <button
            onClick={calculate}
            className="col-span-4 h-16 rounded-2xl bg-white text-lg font-bold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            =
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-zinc-700">
          Puedes utilizar el teclado de tu computadora.
        </p>
      </div>

      {/* HISTORY */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Actividad
            </p>

            <h2 className="mt-1 text-xl font-bold">Historial</h2>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-xs text-zinc-600 transition hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-white/10">
            <div className="text-center">
              <div className="mb-3 text-3xl">🧮</div>

              <p className="text-sm text-zinc-500">
                Todavía no hay operaciones.
              </p>

              <p className="mt-1 text-xs text-zinc-700">
                Tus cálculos aparecerán aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setDisplay(item.result);
                  setExpression(item.result.replace(/,/g, ""));
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-right transition hover:bg-white/[0.05]"
              >
                <div className="text-xs text-zinc-600">
                  {item.expression}
                </div>

                <div className="mt-1 text-lg font-semibold text-white">
                  = {item.result}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="border-t border-white/10">
    <div className="mx-auto max-w-7xl px-5 py-8 text-center text-sm text-zinc-700">
      © 2026 MedwinxTools
    </div>
  </footer>
</main>

);
}