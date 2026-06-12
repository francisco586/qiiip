import { useEffect, useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useInView,
  animate,
} from 'framer-motion'

const spring = { type: 'spring', stiffness: 260, damping: 22 }

function Orbs() {
  const orbs = [
    { size: 480, color: 'var(--violet)', x: '-12%', y: '-10%', dur: 18 },
    { size: 380, color: 'var(--cyan)', x: '70%', y: '15%', dur: 22 },
    { size: 420, color: 'var(--pink)', x: '25%', y: '65%', dur: 26 },
  ]
  return (
    <div className="orbs">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="orb"
          style={{ width: o.size, height: o.size, background: o.color, left: o.x, top: o.y }}
          animate={{ x: [0, 60, -40, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function Nav() {
  return (
    <motion.nav
      className="nav"
      initial={{ y: -80, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ ...spring, delay: 0.6 }}
    >
      <span className="logo">qiiip</span>
      <a href="#capacidades">Capacidades</a>
      <a href="#cifras">Cifras</a>
      <a href="#juega">Juega</a>
    </motion.nav>
  )
}

function AnimatedTitle({ text }) {
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  }
  const char = {
    hidden: { y: '110%', rotate: 8, opacity: 0 },
    visible: { y: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 180, damping: 16 } },
  }
  return (
    <motion.h1 variants={container} initial="hidden" animate="visible" aria-label={text}>
      {text.split('').map((c, i) => (
        <motion.span key={i} className="char" variants={char}>
          {c}
        </motion.span>
      ))}
    </motion.h1>
  )
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 220])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section className="hero" ref={ref}>
      <motion.div style={{ y, opacity }}>
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.span
            className="dot"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          hecho con framer-motion
        </motion.div>

        <AnimatedTitle text="qiiip" />

        <motion.p
          className="tagline"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          Una demo de lo que puede hacer una interfaz cuando cada píxel se mueve{' '}
          <em>con intención</em>. Texto escalonado, físicas de resorte, scroll
          parallax y elementos arrastrables — todo en una página.
        </motion.p>

        <motion.div
          className="cta-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <motion.button
            className="btn primary"
            whileHover={{ scale: 1.06, boxShadow: '0 12px 60px rgba(139,92,246,0.7)' }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
          >
            Empezar ahora →
          </motion.button>
          <motion.button
            className="btn ghost"
            whileHover={{ scale: 1.06, borderColor: 'rgba(255,255,255,0.35)' }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
          >
            Ver el código
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-hint"
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        desliza ↓
      </motion.div>
    </section>
  )
}

function Marquee() {
  const items = ['resortes', 'parallax', 'stagger', 'gestos', 'drag', 'layout', 'scroll', 'hover']
  const track = items.map((w, i) => (
    <span key={i}>
      <b>{w}</b> ✦
    </span>
  ))
  return (
    <div className="marquee">
      <motion.div
        className="marquee-track"
        animate={{ x: '-50%' }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {track}
        {track.map((el, i) => (
          <span key={`b${i}`}>{el.props.children}</span>
        ))}
      </motion.div>
    </div>
  )
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

function TiltCard({ icon, title, children, delay }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)

  function onMove(e) {
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14)
  }
  function onLeave() {
    animate(rx, 0, spring)
    animate(ry, 0, spring)
  }

  return (
    <Reveal delay={delay}>
      <motion.div
        ref={ref}
        className="card"
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.03 }}
        transition={spring}
      >
        <div className="glow" />
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <p>{children}</p>
      </motion.div>
    </Reveal>
  )
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix
      },
    })
    return () => controls.stop()
  }, [inView, to, suffix])

  return <span ref={ref}>0{suffix}</span>
}

function Playground() {
  const areaRef = useRef(null)
  const toys = [
    { emoji: '🪐', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { emoji: '⚡', bg: 'linear-gradient(135deg,#22d3ee,#0e7490)' },
    { emoji: '🔥', bg: 'linear-gradient(135deg,#f472b6,#be185d)' },
    { emoji: '🌙', bg: 'linear-gradient(135deg,#fbbf24,#b45309)' },
  ]
  return (
    <div className="playground" ref={areaRef}>
      {toys.map((t, i) => (
        <motion.div
          key={i}
          className="toy"
          style={{ background: t.bg }}
          drag
          dragConstraints={areaRef}
          dragElastic={0.25}
          whileDrag={{ scale: 1.2, rotate: 8, zIndex: 10 }}
          whileHover={{ scale: 1.1, rotate: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
        >
          {t.emoji}
        </motion.div>
      ))}
      <p className="playground-hint">↑ Arrástralos. Tienen físicas de resorte reales.</p>
    </div>
  )
}

export default function App() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div className="app">
      <motion.div className="progress-bar" style={{ scaleX }} />
      <Orbs />
      <div className="grain" />
      <Nav />

      <main>
        <Hero />
        <Marquee />

        <section className="block" id="capacidades">
          <Reveal>
            <h2 className="section-title">Movimiento que comunica.</h2>
            <p className="section-sub">
              Cada tarjeta entra al hacer scroll, se inclina en 3D siguiendo tu
              cursor y brilla al pasar por encima.
            </p>
          </Reveal>
          <div className="grid">
            <TiltCard icon="🎯" title="Stagger orquestado" delay={0}>
              El título del hero se revela letra a letra con variants
              encadenados y físicas de resorte, sin un solo keyframe manual.
            </TiltCard>
            <TiltCard icon="🌀" title="Scroll como narrativa" delay={0.12}>
              Parallax en el hero, barra de progreso con resorte y secciones
              que aparecen justo cuando entran en el viewport.
            </TiltCard>
            <TiltCard icon="🧲" title="Gestos naturales" delay={0.24}>
              Hover, tap y drag con la misma física. Esta tarjeta rota en 3D
              siguiendo tu ratón gracias a motion values.
            </TiltCard>
          </div>
        </section>

        <section className="block" id="cifras">
          <Reveal>
            <h2 className="section-title">En cifras.</h2>
            <p className="section-sub">
              Contadores que se animan al entrar en pantalla, una sola vez.
            </p>
          </Reveal>
          <div className="stats">
            {[
              { to: 60, suffix: 'fps', label: 'fluidez constante' },
              { to: 12, suffix: '', label: 'animaciones distintas' },
              { to: 0, suffix: '', label: 'keyframes escritos a mano' },
              { to: 100, suffix: '%', label: 'framer-motion' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="stat">
                  <div className="value">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="label">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block" id="juega">
          <Reveal>
            <h2 className="section-title">Tócalo. Es real.</h2>
            <p className="section-sub">
              Nada de vídeos: estos elementos responden a tu cursor con
              elasticidad y límites de arrastre.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Playground />
          </Reveal>
        </section>

        <footer>
          <Reveal>
            <div className="big">qiiip</div>
          </Reveal>
          <p>Construido en una sesión con React, Vite y framer-motion.</p>
        </footer>
      </main>
    </div>
  )
}
