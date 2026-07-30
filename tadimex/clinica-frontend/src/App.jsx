import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { RegisterScreen } from './screens/RegisterScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { LoginScreen } from './screens/LoginScreen'
import { EnterpriseProvider } from './context/EnterpriseContext'
import { BranchProvider } from './context/BranchContext'
import { MessagesHandlerScreen } from './screens/MessagesHandlerScreen'
import { CataloguesScreen } from './screens/CataloguesScreen'
import HomeScreen from './screens/HomeScreen'



function App() {
  return (
    <>
    <EnterpriseProvider>
      <BranchProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/catalogos' element={<CataloguesScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </BranchProvider>
    </EnterpriseProvider>
    </>
  )
}

export default App
