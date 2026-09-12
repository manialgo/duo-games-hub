/**
 * App.jsx — Root component with React Router
 */
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Hub from './components/Hub'
import Auth from './components/Auth'
import TiltTowerGameWrapper from './games/tilt-tower/TiltTowerWrapper'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/play/tilt-tower" element={<TiltTowerGameWrapper />} />
      </Routes>
    </BrowserRouter>
  )
}
