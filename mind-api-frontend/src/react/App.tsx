import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { reactRouter } from './router'

export function App() {
  return (
    <>
      <RouterProvider router={reactRouter} />
      <Toaster position="top-center" richColors />
    </>
  )
}
