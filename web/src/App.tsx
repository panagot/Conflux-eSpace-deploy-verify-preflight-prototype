import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DoctorProvider, useDoctorContext } from './context/DoctorContext'
import { TopBar } from './components/TopBar'
import { Footer } from './components/Footer'
import { AssistantFab } from './components/AssistantFab'
import { DashboardPage } from './pages/DashboardPage'
import { UsagePage } from './pages/UsagePage'
import { MilestonesPage } from './pages/MilestonesPage'

function AppShell() {
  const { network, selected } = useDoctorContext()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <TopBar network={network} selected={selected} />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
      </Routes>
      <Footer />
      <AssistantFab />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DoctorProvider>
        <AppShell />
      </DoctorProvider>
    </BrowserRouter>
  )
}
