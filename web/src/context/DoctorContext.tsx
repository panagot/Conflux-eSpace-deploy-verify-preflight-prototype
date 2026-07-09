import { createContext, useContext, type ReactNode } from 'react'
import { useDoctor } from '../hooks/useDoctor'

type DoctorContextValue = ReturnType<typeof useDoctor>

const DoctorContext = createContext<DoctorContextValue | null>(null)

export function DoctorProvider({ children }: { children: ReactNode }) {
  const value = useDoctor()
  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
}

export function useDoctorContext() {
  const ctx = useContext(DoctorContext)
  if (!ctx) throw new Error('useDoctorContext must be used within DoctorProvider')
  return ctx
}
