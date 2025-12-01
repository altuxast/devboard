import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import Login from './components/Login';
import './App.css';

function App() {
  const boardId = '6921b1185c34a22a8973cb63'; // Ensure boardId is correct

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Login page route */}
        <Route path="/board" element={<Board boardId={boardId} />} /> {/* Board page route */}
        <Route path="/" element={<Login />} /> {/* Default route redirects to login */}
      </Routes>
    </Router>
  );
}

export default App;
