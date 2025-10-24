import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './Inicio'
import UsersAdmin from './UsersAdmin'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/users-admin" element={<UsersAdmin />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
