export type Tool = {
name: string;
description: string;
category: string;
icon: string;
href: string;
available: boolean;
};

export const tools: Tool[] = [
{
name: "Calculadora",
description: "Realiza cálculos rápidos y sencillos.",
category: "Calculadoras",
icon: "🧮",
href: "/herramientas/calculadora",
available: true,
},

{
name: "Generador de contraseñas",
description: "Crea contraseñas seguras y aleatorias.",
category: "Generadores",
icon: "🔐",
href: "/herramientas/generador-password",
available: true,
},

{
name: "Contador de palabras",
description: "Cuenta palabras, caracteres y líneas de un texto.",
category: "Texto",
icon: "📝",
href: "/herramientas/contador-palabras",
available: false,
},

{
name: "Conversor de unidades",
description: "Convierte fácilmente entre diferentes unidades.",
category: "Calculadoras",
icon: "📏",
href: "/herramientas/conversor-unidades",
available: false,
},

{
name: "JSON Formatter",
description: "Organiza y formatea código JSON.",
category: "Programación",
icon: "{ }",
href: "/herramientas/json-formatter",
available: true,
},

{
name: "Generador de UUID",
description: "Genera identificadores UUID rápidamente.",
category: "Programación",
icon: "🆔",
href: "/herramientas/generador-uuid",
available: false,
},

{
name: "Redimensionar imagen",
description: "Cambia el tamaño de tus imágenes fácilmente.",
category: "Imágenes",
icon: "🖼️",
href: "/herramientas/redimensionar-imagen",
available: true,
},

{
  name: "Recortar y dar forma",
  description:
    "Recorta imágenes y crea formas con bordes redondeados, círculos, corazones y más.",
  category: "Imágenes",
  icon: "✂️",
  href: "/herramientas/recortar-imagen",
  available: true,
},

{
name: "Comprimir imagen",
description: "Reduce el tamaño de tus imágenes.",
category: "Imágenes",
icon: "📦",
href: "/herramientas/comprimir-imagen",
available: true,
},

{
  name: "Convertir imagen",
  description: "Convierte imágenes entre JPG, PNG y WEBP.",
  category: "Imágenes",
  icon: "🔄",
  href: "/herramientas/convertir-imagen",
  available: true,
},

{
name: "Generador QR",
description: "Crea códigos QR de forma rápida.",
category: "Generadores",
icon: "▦",
href: "/herramientas/generador-qr",
available: true,
},

{
name: "Editor de texto",
description: "Escribe, limpia y transforma texto.",
category: "Texto",
icon: "✏️",
href: "/herramientas/analizador-texto",
available: true,
},

{
name: "Base64",
description: "Codifica y decodifica texto en Base64.",
category: "Programación",
icon: "🔤",
href: "/herramientas/base64",
available: false,
},

{
name: "Calculadora de porcentaje",
description: "Calcula porcentajes de forma sencilla.",
category: "Calculadoras",
icon: "%",
href: "/herramientas/porcentaje",
available: false,
},

{
  name: "Unir PDF",
  description: "Combina varios archivos PDF en un solo documento.",
  category: "PDF",
  icon: "📄",
  href: "/herramientas/unir-pdf",
  available: true,
},

{
  name: "Comprimir PDF",
  description: "Optimiza un archivo PDF para reducir su tamaño.",
  category: "PDF",
  icon: "📦",
  href: "/herramientas/comprimir-pdf",
  available: true,
},

{
  name: "Imágenes a PDF",
  description: "Convierte varias imágenes en un solo archivo PDF.",
  category: "PDF",
  icon: "🖼️",
  href: "/herramientas/imagenes-pdf",
  available: true,
},

{
  name: "PDF a Imágenes",
  description: "Convierte las páginas de un PDF en imágenes JPG o PNG.",
  category: "PDF",
  icon: "📸",
  href: "/herramientas/pdf-imagenes",
  available: true,
},

{
  name: "Dividir PDF",
  description: "Extrae páginas específicas de un archivo PDF.",
  category: "PDF",
  icon: "✂️",
  href: "/herramientas/dividir-pdf",
  available: true,
},

{
  name: "PDF a Texto",
  description: "Extrae el texto de un archivo PDF directamente desde el navegador.",
  category: "PDF",
  icon: "📝",
  href: "/herramientas/pdf-texto",
  available: true,
}

];