import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx'
import AdminDashboard from "./AdminDashboard";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/Register" element={<Register/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Dashboard" element={<Dashboard/>}/>
        <Route path="/AdminDashboard" element={<AdminDashboard />}
/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
