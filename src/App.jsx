import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import heroImg from './assets/hero.png'

const easeOut = [0.21, 0.47, 0.32, 0.98]

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7.5h12l-1.4 11.5h-9.2L6 7.5z" />
      <path d="M9 7.5a3 3 0 0 1 6 0" />
    </svg>
  )
}

function Nav() {
  return (
    <motion.header
      className="nav"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
    >
      <a className="logo" href="#" aria-label="Forma Chair">
        F
      </a>

      <nav className="nav-links" aria-label="Navegación principal">
        <a href="#">
          Tienda <span className="chev">⌄</span>
        </a>
        <a href="#">Compañía</a>
        <a href="#">Reseñas</a>
        <a href="#">Contacto</a>
      </nav>

      <div className="nav-right">
        <a className="phone" href="tel:+34900555555">
          +34 900 555 555
        </a>
        <motion.button className="btn lime" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Carrito <CartIcon />
        </motion.button>
        <button className="burger" aria-label="Menú">
          <span />
          <span />
        </button>
      </div>
    </motion.header>
  )
}

function Headline() {
  const lines = ['Forma', 'Chair']
  return (
    <h1 className="headline" aria-label="Forma Chair">
      {lines.map((line, i) => (
        <span className="mask" key={line}>
          <motion.span
            className="line"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 + i * 0.15, ease: easeOut }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

function ProductCard() {
  return (
    <motion.aside
      className="product-card"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.8, ease: easeOut }}
      whileHover={{ y: -6 }}
    >
      <div className="thumb">
        <img src={heroImg} alt="Silla Lounge en terracota" />
      </div>
      <div className="info">
        <h3>Lounge</h3>
        <p>Terracota, roble</p>
        <motion.button className="btn lime buy" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Comprar <CartIcon />
        </motion.button>
      </div>
    </motion.aside>
  )
}

export default function App() {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const bgX = useTransform(sx, [-0.5, 0.5], ['1.5%', '-1.5%'])
  const bgY = useTransform(sy, [-0.5, 0.5], ['1%', '-1%'])

  function onMouseMove(e) {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <main className="hero" ref={ref} onMouseMove={onMouseMove}>
      <motion.div
        className="hero-bg"
        style={{ x: bgX, y: bgY }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 1.8, ease: easeOut }}
      >
        <img src={heroImg} alt="" />
      </motion.div>
      <div className="overlay" />

      <Nav />

      <section className="content">
        <Headline />

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease: easeOut }}
        >
          <p className="lead">
            Curvas que abrazan y materiales que perduran. Prueba cómo el confort
            y el diseño juegan juntos, adaptándose a tu espacio y a tu estado de
            ánimo.
          </p>
          <motion.a className="btn ghost" href="#" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            Ver catálogo <span className="arrow">→</span>
          </motion.a>
        </motion.div>

        <ProductCard />
      </section>
    </main>
  )
}
