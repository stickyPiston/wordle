import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import Home from "./Home";
import Game from "./Game";

// Hello world
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/wordle">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Game />} /> 
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
