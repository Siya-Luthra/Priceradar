import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ProductInsights from './pages/ProductInsights'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/product/:id" element={<ProductInsights />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
