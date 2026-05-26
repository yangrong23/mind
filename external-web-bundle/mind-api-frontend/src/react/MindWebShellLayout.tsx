import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const SHELL_CLASS = 'mind-web-shell'

/** Matches Next app layout: Inter + #f7f7f8 canvas; overrides TDesign #eee body from index.html */
export function MindWebShellLayout() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const app = document.getElementById('app')
    html.classList.add(SHELL_CLASS)
    body.classList.add(SHELL_CLASS)
    app?.classList.add(SHELL_CLASS)
    html.style.setProperty('--font-app', "'Inter', ui-sans-serif, system-ui, sans-serif")
    return () => {
      html.classList.remove(SHELL_CLASS)
      body.classList.remove(SHELL_CLASS)
      app?.classList.remove(SHELL_CLASS)
    }
  }, [])

  return <Outlet />
}
