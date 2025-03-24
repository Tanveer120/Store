// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeChat from './pages/EmployeeChat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<EmployeeLogin />} />
        <Route path="/employee/chat" element={<EmployeeChat />} />
      </Routes>
    </Router>
  );
};

export default App;
