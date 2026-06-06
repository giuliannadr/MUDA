import { useState, useEffect, useRef } from 'react'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Inicio from './components/Inicio'
import QuienesSomos from './components/QuienesSomos'
import Produccion from './components/Produccion'
import ProduccionFoto from './components/ProduccionFoto'
import ProduccionCreativa from './components/ProduccionCreativa'
import ProduccionRedes from './components/ProduccionRedes'
import Eventos from './components/Eventos'
import Agencia from './components/Agencia'
import Estudio from './components/Estudio'
import Contacto from './components/Contacto'
import Sumate from './components/Sumate'
import './App.css'

export type View = 'inicio' | 'quienes' | 'produccion' | 'foto-video' | 'direccion-creativa' | 'contenido-redes' | 'eventos' | 'agencia' | 'estudio' | 'contacto' | 'sumate'

const ALL_VIEWS: View[] = ['inicio', 'quienes', 'produccion', 'foto-video', 'direccion-creativa', 'contenido-redes', 'eventos', 'agencia', 'estudio', 'contacto', 'sumate']

// Lee la sección desde la URL (#estudio, #agencia, etc.)
const viewFromHash = (): View => {
  const h = window.location.hash.replace('#', '') as View
  return ALL_VIEWS.includes(h) ? h : 'inicio'
}

export default function App() {
  const initial = viewFromHash()
  const [current, setCurrent] = useState<View>(initial)
  const [displayed, setDisplayed] = useState<View>(initial)
  const [animating, setAnimating] = useState(false)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const homeScroll = useRef(0)   // recuerda dónde quedó el scroll del home

  const navigate = (view: View) => {
    if (view === current || animating) return
    // Al salir del home, guardar la posición de scroll actual
    if (current === 'inicio' && mainRef.current) {
      homeScroll.current = mainRef.current.scrollTop
    }
    setAnimating(true)
    // Reflejar la sección en la URL para que al recargar se mantenga
    if (view === 'inicio') window.history.pushState(null, '', window.location.pathname)
    else window.history.pushState(null, '', `#${view}`)
    setTimeout(() => {
      setDisplayed(view)
      setCurrent(view)
      // Volver al home → restaurar posición; a otra sección → arriba
      const top = view === 'inicio' ? homeScroll.current : 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => mainRef.current?.scrollTo({ top }))
      })
      setAnimating(false)
    }, 300)
  }

  // Botón atrás/adelante del navegador → cambiar de sección
  useEffect(() => {
    const onPop = () => {
      const v = viewFromHash()
      setCurrent(v)
      setDisplayed(v)
      requestAnimationFrame(() => mainRef.current?.scrollTo({ top: 0 }))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll<HTMLElement>('.reveal')
      reveals.forEach(el => el.classList.remove('visible'))
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
        }),
        { threshold: 0.08 }
      )
      document.querySelectorAll<HTMLElement>('.reveal').forEach(el => observer.observe(el))
      return () => observer.disconnect()
    }, 60)
    return () => clearTimeout(timer)
  }, [displayed])

  const renderView = () => {
    switch (displayed) {
      case 'inicio':     return <Inicio navigate={navigate} onCurtainChange={setCurtainOpen} />
      case 'quienes':    return <QuienesSomos />
      case 'produccion':          return <Produccion />
      case 'foto-video':          return <ProduccionFoto />
      case 'direccion-creativa':  return <ProduccionCreativa />
      case 'contenido-redes':     return <ProduccionRedes />
      case 'eventos':    return <Eventos />
      case 'agencia':    return <Agencia navigate={navigate} />
      case 'estudio':    return <Estudio />
      case 'contacto':   return <Contacto />
      case 'sumate':     return <Sumate navigate={navigate} />
    }
  }

  return (
    <>
      <div className="grain" />
      <Cursor />
      {(current !== 'inicio' || curtainOpen) && <Nav current={current} navigate={navigate} />}
      <div
        ref={mainRef}
        className={`view-wrap ${animating ? 'view-exit' : 'view-enter'}`}
      >
        {renderView()}
      </div>
    </>
  )
}
