

import React, { useEffect, useState, useRef } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import "./index.css";

import HomePage from "./components/HomePage";

import ReactDOM from "react-dom/client";

import TypingPage from './pages/TypingPage';


import HelpPage from "./components/HelpPage";

const App = () => {

  return (
    <Router
      basename={process.env.PUBLIC_URL}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route
          path="/game"
          element={
            <TypingPage/>
          }
        />
      </Routes>
    </Router>
  );
};

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export default App;
