import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useInView,
  animate,
} from 'framer-motion'
import GLCanvas from './GLCanvas.jsx'

import trimmer from './assets/trimmer.jpeg'
import frambini from './assets/frambini.jpeg'
import interior from './assets/interior.jpeg'
import stool from './assets/stool.jpeg'
import team from './assets/team.jpeg'

const spring = { type: 'spring', stiffness: 260, damping: 22 }

/* ------------------------------------------------------------------ */
/* Custom cursor — a difference-blend ring that grows over hot zones.  */
/* ------------------------------------------------------------------ */
function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  const [hot, setHot] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    document.body.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target
      setHot(!!(t.closest && t.closest('a,button,.magnetic,.hot')))
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      document.body.classList.remove('has-cursor')
    }
  }, [x, y])

  return (
    <motion.div
      className="cursor"
      style={{ x: sx, y: sy }}
      animate={{ scale: hot ? 2.4 : 1, opacity: hot ? 0.6 : 1 }}
      transition={spring}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Loader — battery fills 0 → 100, a nod to the trimmer readout.       */
/* ------------------------------------------------------------------ */
function Loader({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const c = animate(0, 100, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setTimeout(onDone, 450),
    })
    return () => c.stop()
  }, [onDone])
  return (
    <motion.div
      className="loader"
      exit={{ y: '-100%' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-inner">
        <div className="loader-num">
          {String(n).padStart(3, '0')}
          <span>%</span>
        </div>
        <div className="loader-bar">
          <motion.div
            className="loader-fill"
            style={{ scaleX: n / 100 }}
          />
        </div>
        <div className="loader-label">qiiip studio — cargando</div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Magnetic button — leans toward the pointer.                          */
/* ------------------------------------------------------------------ */
function Magnetic({ children, className = '', ...rest }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 300, damping: 18 })
  const sy = useSpring(my, { stiffness: 300, damping: 18 })
  function move(e) {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.4)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.4)
  }
  function leave() {
    mx.set(0)
    my.set(0)
  }
  return (
    <motion.button
      ref={ref}
      className={`magnetic ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={move}
      onPointerLeave={leave}
      whileTap={{ scale: 0.94 }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Nav                                                                  */
/* ------------------------------------------------------------------ */
function Nav() {
  return (
    <motion.nav
      className="nav"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...spring, delay: 0.3 }}
    >
      <span className="logo">qiiip<i>®</i></span>
      <div className="nav-links">
        <a href="#trabajo">Trabajo</a>
        <a href="#producto">Producto</a>
        <a href="#estudio">Estudio</a>
        <a href="#contacto" className="nav-cta">Hablemos</a>
      </div>
    </motion.nav>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */
function KineticTitle({ text }) {
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  }
  const char = {
    hidden: { y: '120%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 200, damping: 18 },
    },
  }
  return (
    <motion.h1 variants={container} initial="hidden" animate="visible" aria-label={text}>
      {text.split('').map((c, i) => (
        <span className="char-mask" key={i}>
          <motion.span className="char" variants={char}>
            {c}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  )
}

function Battery() {
  const ref = useRef(null)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const c = animate(0, 85, {
      duration: 2.4,
      delay: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setPct(Math.round(v)),
    })
    return () => c.stop()
  }, [])
  return (
    <div className="battery hot" title="Como en el producto: 85%">
      <span className="battery-lock">🔒</span>
      <span className="battery-num">{pct}</span>
      <span className="battery-pct">%</span>
      <div className="battery-track">
        <div className="battery-cell" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 240])
  const imgY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const rot = useTransform(scrollYProgress, [0, 1], [0, 10])

  const tilt = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  function tiltMove(e) {
    const r = tilt.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 18)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18)
  }
  function tiltLeave() {
    animate(rx, 0, spring)
    animate(ry, 0, spring)
  }

  return (
    <section className="hero" ref={ref}>
      <GLCanvas className="hero-gl" />
      <div className="hero-grad" />

      <motion.div className="hero-copy" style={{ y, opacity }}>
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="dot"
            animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          estudio de diseño & movimiento
        </motion.div>

        <KineticTitle text="qiiip" />

        <motion.p
          className="tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          Diseñamos objetos, marcas y espacios que se{' '}
          <em>mueven con intención</em>. Producto industrial, CGI, dirección de
          arte y experiencias digirales — renderizadas en tiempo real.
        </motion.p>

        <motion.div
          className="cta-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <Magnetic className="btn primary" onClick={() => scrollTo('trabajo')}>
            Ver el trabajo →
          </Magnetic>
          <Magnetic className="btn ghost" onClick={() => scrollTo('producto')}>
            Producto interactivo
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-product"
        style={{ y: imgY, rotate: rot }}
        ref={tilt}
        onPointerMove={tiltMove}
        onPointerLeave={tiltLeave}
        initial={{ opacity: 0, scale: 0.8, x: 60 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="hero-product-inner"
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        >
          <img src={trimmer} alt="qiiip Edge — recortadora de precisión" />
          <div className="hero-product-glow" />
        </motion.div>
        <Battery />
        <span className="hero-tag hero-tag-a">Edge · 01</span>
        <span className="hero-tag hero-tag-b">aleación · 60fps</span>
      </motion.div>

      <motion.div
        className="scroll-hint"
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        desliza
      </motion.div>
    </section>
  )
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/* ------------------------------------------------------------------ */
/* Marquee                                                              */
/* ------------------------------------------------------------------ */
function Marquee() {
  const items = [
    'producto industrial',
    'cgi & 3d',
    'dirección de arte',
    'packaging',
    'identidad',
    'motion',
    'espacios',
    'web',
  ]
  const Track = () => (
    <div className="marquee-track-inner">
      {items.map((w, i) => (
        <span key={i}>
          {w} <b>✦</b>
        </span>
      ))}
    </div>
  )
  return (
    <div className="marquee">
      <motion.div
        className="marquee-track"
        animate={{ x: '-50%' }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <Track />
        <Track />
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Horizontal scroll gallery                                            */
/* ------------------------------------------------------------------ */
const WORKS = [
  {
    img: trimmer,
    idx: '01',
    title: 'Edge',
    cat: 'Producto industrial',
    text: 'Recortadora de precisión. Cuerpo en aleación, dial mecanizado y lectura digital. Atada al detalle.',
  },
  {
    img: frambini,
    idx: '02',
    title: 'Frambini',
    cat: 'Packaging & CGI',
    text: 'Bodegón ultrarrealista: malta fresca, hielo cristalino y condensación renderizada cuadro a cuadro.',
  },
  {
    img: interior,
    idx: '03',
    title: 'Sesann',
    cat: 'Editorial de espacio',
    text: 'Dirección de arte para mobiliario: cuero coñac, luz cálida y composición editorial impecable.',
  },
  {
    img: stool,
    idx: '04',
    title: 'Bind',
    cat: 'Estudio de material',
    text: 'Roble macizo y cuerda acid-green. Una exploración de tensión, nudo y contraste cromático.',
  },
  {
    img: team,
    idx: '05',
    title: 'Wise Up',
    cat: 'Marca & personas',
    text: 'Sistema de marca para un colectivo creativo. Retrato cenital del equipo como pieza central.',
  },
]

function HorizontalGallery() {
  const ref = useRef(null)
  const trackRef = useRef(null)
  const [dist, setDist] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref })
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const x = useSpring(xRaw, { stiffness: 90, damping: 24, mass: 0.4 })

  useEffect(() => {
    const calc = () => {
      if (trackRef.current)
        setDist(
          Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 80)
        )
    }
    calc()
    window.addEventListener('resize', calc)
    const t = setTimeout(calc, 400)
    return () => {
      window.removeEventListener('resize', calc)
      clearTimeout(t)
    }
  }, [])

  return (
    <section
      className="hgal"
      id="trabajo"
      ref={ref}
      style={{ height: `${WORKS.length * 95 + 40}vh` }}
    >
      <div className="hgal-sticky">
        <div className="hgal-head">
          <span className="kicker">/ trabajo seleccionado</span>
          <h2>Hecho para moverse.</h2>
        </div>
        <motion.div className="hgal-track" style={{ x }} ref={trackRef}>
          {WORKS.map((w, i) => (
            <Panel key={w.idx} w={w} i={i} progress={scrollYProgress} />
          ))}
          <div className="hgal-end">
            <span>scroll</span>
            <h3>seguimos →</h3>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Panel({ w, i, progress }) {
  // gentle counter-parallax on the image inside each panel
  const imgX = useTransform(progress, [0, 1], [40, -40])
  return (
    <article className="panel hot">
      <div className="panel-media">
        <motion.img src={w.img} alt={w.title} style={{ x: imgX, scale: 1.18 }} />
        <span className="panel-idx">{w.idx}</span>
      </div>
      <div className="panel-meta">
        <span className="panel-cat">{w.cat}</span>
        <h3>{w.title}</h3>
        <p>{w.text}</p>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Reveal helper                                                        */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Interactive product configurator                                     */
/* ------------------------------------------------------------------ */
function Product() {
  const [len, setLen] = useState(3.0)
  const [bat, setBat] = useState(85)
  const frame = useRef(null)
  const sx = useMotionValue(50)
  const sy = useMotionValue(45)
  const maskX = useSpring(sx, { stiffness: 200, damping: 25 })
  const maskY = useSpring(sy, { stiffness: 200, damping: 25 })
  const mask = useMotionTemplate`radial-gradient(circle 220px at ${maskX}% ${maskY}%, rgba(198,247,63,0.32), transparent 70%)`

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)

  function move(e) {
    const r = frame.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    sx.set(px * 100)
    sy.set(py * 100)
    ry.set((px - 0.5) * 16)
    rx.set(-(py - 0.5) * 16)
  }
  function leave() {
    animate(rx, 0, spring)
    animate(ry, 0, spring)
  }

  const bars = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <section className="product" id="producto">
      <Reveal>
        <span className="kicker">/ producto interactivo</span>
        <h2 className="section-title">Configura el Edge.</h2>
        <p className="section-sub">
          Mueve el cursor sobre la pieza para iluminarla. Ajusta el largo de
          corte y la carga — todo responde en vivo.
        </p>
      </Reveal>

      <div className="product-grid">
        <motion.div
          className="product-frame hot"
          ref={frame}
          onPointerMove={move}
          onPointerLeave={leave}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src={trimmer}
            alt="qiiip Edge"
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
          />
          <motion.div className="product-spot" style={{ background: mask }} />
          <div className="product-readout">
            <span>{len.toFixed(1)} mm</span>
            <i>·</i>
            <span>{bat}%</span>
          </div>
        </motion.div>

        <div className="product-controls">
          <div className="ctrl">
            <div className="ctrl-top">
              <label>Largo de corte</label>
              <span className="ctrl-val">{len.toFixed(1)} mm</span>
            </div>
            <div className="ctrl-bars">
              {bars.map((b) => (
                <motion.span
                  key={b}
                  className={`bar ${b <= len ? 'on' : ''}`}
                  animate={{ height: b <= len ? 38 : 14 }}
                  transition={spring}
                />
              ))}
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={len}
              onChange={(e) => setLen(+e.target.value)}
              className="slider"
            />
          </div>

          <div className="ctrl">
            <div className="ctrl-top">
              <label>Carga de batería</label>
              <span className="ctrl-val">{bat}%</span>
            </div>
            <div className="ring-row">
              <svg viewBox="0 0 120 120" className="ring">
                <circle className="ring-bg" cx="60" cy="60" r="52" />
                <motion.circle
                  className="ring-fg"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray={2 * Math.PI * 52}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 52 * (1 - bat / 100),
                  }}
                  transition={spring}
                />
                <text x="60" y="66" className="ring-text">
                  {bat}%
                </text>
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bat}
                onChange={(e) => setBat(+e.target.value)}
                className="slider"
              />
            </div>
          </div>

          <div className="spec-row">
            {[
              ['Motor', '10.000 rpm'],
              ['Autonomía', '90 min'],
              ['Carga', 'USB-C'],
              ['Resist.', 'IPX7'],
            ].map(([k, v]) => (
              <div className="spec" key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Full-bleed generative film section                                   */
/* ------------------------------------------------------------------ */
function Film() {
  return (
    <section className="film">
      <GLCanvas className="film-gl" intensity={1.4} />
      <div className="film-overlay">
        <Reveal>
          <span className="kicker light">/ render en tiempo real</span>
          <h2>
            No es un vídeo.
            <br />
            Es código dibujando luz.
          </h2>
          <p>
            Este fondo es un shader de fragmentos ejecutándose en tu GPU, ahora
            mismo, a 60fps. Mueve el cursor — la luz te sigue.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Stats                                                                */
/* ------------------------------------------------------------------ */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix
      },
    })
    return () => c.stop()
  }, [inView, to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

function Stats() {
  const data = [
    { to: 120, suffix: '+', label: 'proyectos entregados' },
    { to: 14, suffix: '', label: 'premios de diseño' },
    { to: 60, suffix: 'fps', label: 'en tiempo real' },
    { to: 9, suffix: '', label: 'países' },
  ]
  return (
    <section className="block" id="estudio">
      <Reveal>
        <span className="kicker">/ el estudio</span>
        <h2 className="section-title">En cifras.</h2>
      </Reveal>
      <div className="stats">
        {data.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div className="stat hot">
              <div className="value">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="label">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Draggable physics playground                                         */
/* ------------------------------------------------------------------ */
function Playground() {
  const area = useRef(null)
  const toys = [
    { label: 'Edge', bg: 'linear-gradient(135deg,#c6f73f,#5fa30f)' },
    { label: '3D', bg: 'linear-gradient(135deg,#1e1e1e,#000)' },
    { label: 'CGI', bg: 'linear-gradient(135deg,#f472b6,#be185d)' },
    { label: 'Art', bg: 'linear-gradient(135deg,#22d3ee,#0e7490)' },
    { label: 'Web', bg: 'linear-gradient(135deg,#fbbf24,#b45309)' },
  ]
  return (
    <section className="block">
      <Reveal>
        <span className="kicker">/ tócalo</span>
        <h2 className="section-title">Física real, no vídeo.</h2>
        <p className="section-sub">
          Arrastra las fichas. Rebotan con resortes y respetan los límites del
          lienzo.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="playground hot" ref={area}>
          {toys.map((t, i) => (
            <motion.div
              key={i}
              className="toy"
              style={{ background: t.bg }}
              drag
              dragConstraints={area}
              dragElastic={0.3}
              whileDrag={{ scale: 1.18, rotate: 6, zIndex: 10 }}
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
            >
              {t.label}
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer id="contacto">
      <Reveal>
        <span className="kicker center">/ hablemos</span>
        <div className="footer-big">qiiip</div>
        <Magnetic className="btn primary big">
          francisco@qiiip.com
        </Magnetic>
      </Reveal>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} qiiip studio</span>
        <span>React · Vite · framer-motion · WebGL</span>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
export default function App() {
  const [loading, setLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
  }, [loading])

  return (
    <div className="app">
      <AnimatePresence>
        {loading && <Loader onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <Cursor />
      <motion.div className="progress-bar" style={{ scaleX }} />
      <div className="grain" />
      <Nav />

      <main>
        <Hero />
        <Marquee />
        <HorizontalGallery />
        <Product />
        <Film />
        <Stats />
        <Playground />
        <Footer />
      </main>
    </div>
  )
}
