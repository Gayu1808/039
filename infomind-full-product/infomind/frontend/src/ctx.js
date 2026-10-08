import { createContext, useContext, useEffect, useState } from 'react'
export const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
// fetch + refetch whenever any action bumps the global tick (keeps dashboard numbers live)
export function useData(fn, deps = []) {
  const { tick } = useApp()
  const [d, setD] = useState(null), [err, setErr] = useState(null)
  useEffect(() => { let on = true; fn().then(x => on && setD(x)).catch(e => on && setErr(e.message)); return () => { on = false } }, [tick, ...deps])
  return [d, err]
}
