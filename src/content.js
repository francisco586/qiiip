// ============================================================
//   PANEL DE EDICIÓN — qiiip
//   --------------------------------------------------------
//   Cambia aquí TODOS los textos e imágenes de la web.
//   No hace falta tocar ningún otro archivo.
//   Al guardar y subir el cambio, la web se actualiza sola
//   en https://francisco586.github.io/qiiip/ (1-2 minutos).
//
//   Reglas simples:
//   · Los textos van entre comillas: 'así'.
//   · No borres las comas al final de cada línea.
//   · Para tildes y ñ no hay problema, escribe normal.
// ============================================================

// --- IMÁGENES -----------------------------------------------
//   Para cambiar una foto tienes 2 opciones:
//   A) (lo más fácil) Sube tu nueva imagen a la carpeta
//      src/assets/ con EL MISMO nombre del archivo de abajo
//      (por ejemplo, reemplaza "trimmer.jpeg").
//   B) Sube la imagen con un nombre nuevo a src/assets/ y
//      cambia la ruta de aquí abajo para que apunte a ella.
import imgTrimmer from './assets/trimmer.jpeg'
import imgFrambini from './assets/frambini.jpeg'
import imgInterior from './assets/interior.jpeg'
import imgStool from './assets/stool.jpeg'
import imgTeam from './assets/team.jpeg'

export const content = {
  // ---------- MARCA Y MENÚ ----------
  brand: 'qiiip',
  nav: [
    { label: 'Trabajo', href: '#trabajo' },
    { label: 'Producto', href: '#producto' },
    { label: 'Estudio', href: '#estudio' },
  ],
  navCta: { label: 'Hablemos', href: '#contacto' },

  // ---------- PORTADA (HERO) ----------
  hero: {
    eyebrow: 'estudio de diseño & movimiento',
    title: 'qiiip', // el texto gigante de la portada
    tagline:
      'Diseñamos objetos, marcas y espacios que se mueven con intención. Producto industrial, CGI, dirección de arte y experiencias digitales — renderizadas en tiempo real.',
    // Parte del tagline que aparece subrayada (debe estar tal cual dentro del tagline):
    taglineHighlight: 'mueven con intención',
    ctaPrimary: 'Ver el trabajo →',
    ctaSecondary: 'Producto interactivo',
    image: imgTrimmer,
    batteryTo: 85, // porcentaje al que sube la batería de la portada
    tagA: 'Edge · 01',
    tagB: 'aleación · 60fps',
    scrollHint: 'desliza',
  },

  // ---------- CINTA QUE SE DESPLAZA ----------
  marquee: [
    'producto industrial',
    'cgi & 3d',
    'dirección de arte',
    'packaging',
    'identidad',
    'motion',
    'espacios',
    'web',
  ],

  // ---------- GALERÍA DE TRABAJO ----------
  worksKicker: '/ trabajo seleccionado',
  worksTitle: 'Hecho para moverse.',
  worksEnd: 'seguimos →',
  works: [
    {
      img: imgTrimmer,
      idx: '01',
      title: 'Edge',
      cat: 'Producto industrial',
      text: 'Recortadora de precisión. Cuerpo en aleación, dial mecanizado y lectura digital. Atada al detalle.',
    },
    {
      img: imgFrambini,
      idx: '02',
      title: 'Frambini',
      cat: 'Packaging & CGI',
      text: 'Bodegón ultrarrealista: malta fresca, hielo cristalino y condensación renderizada cuadro a cuadro.',
    },
    {
      img: imgInterior,
      idx: '03',
      title: 'Sesann',
      cat: 'Editorial de espacio',
      text: 'Dirección de arte para mobiliario: cuero coñac, luz cálida y composición editorial impecable.',
    },
    {
      img: imgStool,
      idx: '04',
      title: 'Bind',
      cat: 'Estudio de material',
      text: 'Roble macizo y cuerda acid-green. Una exploración de tensión, nudo y contraste cromático.',
    },
    {
      img: imgTeam,
      idx: '05',
      title: 'Wise Up',
      cat: 'Marca & personas',
      text: 'Sistema de marca para un colectivo creativo. Retrato cenital del equipo como pieza central.',
    },
  ],

  // ---------- PRODUCTO INTERACTIVO ----------
  product: {
    kicker: '/ producto interactivo',
    title: 'Configura el Edge.',
    sub: 'Mueve el cursor sobre la pieza para iluminarla. Ajusta el largo de corte y la carga — todo responde en vivo.',
    image: imgTrimmer,
    lengthLabel: 'Largo de corte',
    batteryLabel: 'Carga de batería',
    // Ficha técnica: [nombre, valor]
    specs: [
      ['Motor', '10.000 rpm'],
      ['Autonomía', '90 min'],
      ['Carga', 'USB-C'],
      ['Resist.', 'IPX7'],
    ],
  },

  // ---------- SECCIÓN "FILM" (fondo animado) ----------
  film: {
    kicker: '/ render en tiempo real',
    // El título va en dos líneas:
    titleLine1: 'No es un vídeo.',
    titleLine2: 'Es código dibujando luz.',
    text: 'Este fondo es un shader de fragmentos ejecutándose en tu GPU, ahora mismo, a 60fps. Mueve el cursor — la luz te sigue.',
  },

  // ---------- CIFRAS ----------
  stats: {
    kicker: '/ el estudio',
    title: 'En cifras.',
    // [número, sufijo, etiqueta]
    items: [
      { to: 120, suffix: '+', label: 'proyectos entregados' },
      { to: 14, suffix: '', label: 'premios de diseño' },
      { to: 60, suffix: 'fps', label: 'en tiempo real' },
      { to: 9, suffix: '', label: 'países' },
    ],
  },

  // ---------- ZONA DE JUEGO (fichas arrastrables) ----------
  playground: {
    kicker: '/ tócalo',
    title: 'Física real, no vídeo.',
    sub: 'Arrastra las fichas. Rebotan con resortes y respetan los límites del lienzo.',
    toys: [
      { label: 'Edge', bg: 'linear-gradient(135deg,#c6f73f,#5fa30f)' },
      { label: '3D', bg: 'linear-gradient(135deg,#1e1e1e,#000)' },
      { label: 'CGI', bg: 'linear-gradient(135deg,#f472b6,#be185d)' },
      { label: 'Art', bg: 'linear-gradient(135deg,#22d3ee,#0e7490)' },
      { label: 'Web', bg: 'linear-gradient(135deg,#fbbf24,#b45309)' },
    ],
  },

  // ---------- PIE / CONTACTO ----------
  footer: {
    kicker: '/ hablemos',
    big: 'qiiip',
    email: 'francisco@qiiip.com',
    credits: 'React · Vite · framer-motion · WebGL',
  },
}

export default content
