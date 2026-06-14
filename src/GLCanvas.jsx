import { useEffect, useRef } from 'react'

/*
 * GLCanvas — a real-time generative "film".
 * A domain-warped fbm fragment shader rendered on the GPU, reacting to the
 * pointer. No video file, yet it never loops the same way twice.
 */

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_intensity;

vec2 hash22(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash22(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                 dot(hash22(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
             mix(dot(hash22(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                 dot(hash22(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 6; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;
  float t = u_time * 0.05;
  vec2 m = (u_mouse - 0.5) * 0.9;

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.4 + 2.0 * q + vec2(1.7, 9.2) + m + t),
                fbm(p * 1.4 + 2.0 * q + vec2(8.3, 2.8) - m));
  float f = fbm(p * 1.4 + 2.6 * r);

  vec3 dark = vec3(0.014, 0.032, 0.028);
  vec3 deep = vec3(0.020, 0.150, 0.110);
  vec3 lime = vec3(0.204, 0.827, 0.600);
  vec3 glow = vec3(0.540, 0.960, 0.780);

  vec3 col = mix(dark, deep, smoothstep(-0.25, 0.65, f));
  col = mix(col, lime, smoothstep(0.25, 0.95, f * f));
  col += glow * 0.30 * smoothstep(0.72, 1.05, f) * length(r) * u_intensity;
  col *= 1.0 - 0.55 * dot(p, p) * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s))
  }
  return s
}

export default function GLCanvas({ className = '', intensity = 1 }) {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const gl =
      canvas.getContext('webgl', { antialias: false, alpha: false }) ||
      canvas.getContext('experimental-webgl')
    if (!gl) {
      canvas.style.background =
        'radial-gradient(circle at 30% 20%, #0c3d2e, #05080a)'
      return
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uInt = gl.getUniformLocation(prog, 'u_intensity')
    gl.uniform1f(uInt, intensity)

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    function resize() {
      const w = canvas.clientWidth,
        h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    function onMove(e) {
      mouse.current.tx = e.clientX / window.innerWidth
      mouse.current.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove)

    let raf
    const start = performance.now()
    let running = true
    const io = new IntersectionObserver(
      ([en]) => (running = en.isIntersecting),
      { threshold: 0 }
    )
    io.observe(canvas)

    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (!running) return
      const m = mouse.current
      m.x += (m.tx - m.x) * 0.05
      m.y += (m.ty - m.y) * 0.05
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform2f(uMouse, m.x, m.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
    }
  }, [intensity])

  return <canvas ref={canvasRef} className={`glcanvas ${className}`} />
}
