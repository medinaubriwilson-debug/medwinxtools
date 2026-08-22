"use client";

import { useState } from "react";

export default function PasswordGeneratorPage() {
const [length, setLength] = useState(16);
const [uppercase, setUppercase] = useState(true);
const [lowercase, setLowercase] = useState(true);
const [numbers, setNumbers] = useState(true);
const [symbols, setSymbols] = useState(true);
const [password, setPassword] = useState("");
const [copied, setCopied] = useState(false);

const generatePassword = () => {
let characters = "";

if (uppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
if (lowercase) characters += "abcdefghijklmnopqrstuvwxyz";
if (numbers) characters += "0123456789";
if (symbols) characters += "!@#$%^&*()-_=+[]{};:,.<>?";

if (!characters) {
  setPassword("");
  return;
}

const randomValues = new Uint32Array(length);
crypto.getRandomValues(randomValues);

let result = "";

for (let i = 0; i < length; i++) {
  result += characters[randomValues[i] % characters.length];
}

setPassword(result);
setCopied(false);

};

const copyPassword = async () => {
if (!password) return;

await navigator.clipboard.writeText(password);

setCopied(true);

setTimeout(() => {
  setCopied(false);
}, 2000);

};

const getStrength = () => {
let score = 0;

if (length >= 12) score++;
if (length >= 16) score++;
if (uppercase) score++;
if (lowercase) score++;
if (numbers) score++;
if (symbols) score++;

if (score <= 2) {
  return {
    text: "Débil",
    width: "30%",
  };
}

if (score <= 4) {
  return {
    text: "Media",
    width: "65%",
  };
}

return {
  text: "Fuerte",
  width: "100%",
};

};

const strength = getStrength();

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
  <section className="mx-auto max-w-5xl px-5 py-12">
    <div className="mb-10">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-600">
        MedwinxTools / Seguridad
      </p>

      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Generador de contraseñas
      </h1>

      <p className="mt-3 max-w-2xl text-zinc-500">
        Crea contraseñas aleatorias y seguras directamente desde tu
        navegador.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* GENERATOR */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <div className="mb-7">
          <label className="mb-3 block text-sm font-medium text-zinc-400">
            Tu contraseña
          </label>

          <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="min-w-0 flex-1 break-all font-mono text-lg text-white">
              {password || "Genera una contraseña"}
            </div>

            <button
              onClick={copyPassword}
              disabled={!password}
              className="shrink-0 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {/* STRENGTH */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-zinc-500">
              Seguridad
            </span>

            <span className="font-medium text-zinc-300">
              {password ? strength.text : "—"}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: password ? strength.width : "0%" }}
            />
          </div>
        </div>

        {/* LENGTH */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400">
              Longitud
            </label>

            <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-semibold">
              {length}
            </span>
          </div>

          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(event) =>
              setLength(Number(event.target.value))
            }
            className="w-full accent-white"
          />

          <div className="mt-2 flex justify-between text-xs text-zinc-700">
            <span>6</span>
            <span>64</span>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="space-y-3">
          <PasswordOption
            label="Mayúsculas"
            description="A-Z"
            checked={uppercase}
            onChange={setUppercase}
          />

          <PasswordOption
            label="Minúsculas"
            description="a-z"
            checked={lowercase}
            onChange={setLowercase}
          />

          <PasswordOption
            label="Números"
            description="0-9"
            checked={numbers}
            onChange={setNumbers}
          />

          <PasswordOption
            label="Símbolos"
            description="!@#$%"
            checked={symbols}
            onChange={setSymbols}
          />
        </div>

        <button
          onClick={generatePassword}
          className="mt-8 w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:bg-zinc-200 active:scale-[0.99]"
        >
          Generar contraseña
        </button>
      </div>

      {/* INFO */}
      <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
          🔐
        </div>

        <h2 className="text-xl font-bold">
          ¿Cómo funciona?
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          La contraseña se genera directamente en tu navegador utilizando
          valores aleatorios criptográficamente seguros.
        </p>

        <div className="my-6 h-px bg-white/10" />

        <h3 className="text-sm font-semibold text-zinc-300">
          Recomendaciones
        </h3>

        <ul className="mt-4 space-y-3 text-sm leading-5 text-zinc-500">
          <li>• Utiliza al menos 12 caracteres.</li>
          <li>• Combina letras, números y símbolos.</li>
          <li>• No reutilices contraseñas importantes.</li>
          <li>• No compartas tus contraseñas.</li>
        </ul>

        <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-5 text-zinc-600">
          Tus contraseñas no se envían a nuestros servidores.
        </div>
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

function PasswordOption({
label,
description,
checked,
onChange,
}: {
label: string;
description: string;
checked: boolean;
onChange: (value: boolean) => void;
}) {
return (
<label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.04]">
<div>
<div className="text-sm font-medium text-zinc-300">
{label}
</div>

    <div className="mt-1 text-xs text-zinc-600">
      {description}
    </div>
  </div>

  <input
    type="checkbox"
    checked={checked}
    onChange={(event) => onChange(event.target.checked)}
    className="h-5 w-5 accent-white"
  />
</label>

);
}