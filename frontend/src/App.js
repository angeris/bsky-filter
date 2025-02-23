import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import SwipeCards from "./components/Card";
import StaticSwipeCards from "./components/Timeline";

function App() {
  return (
    <Router>
      <div className="items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-200">
        <Routes>
          <Route path="/" element={<SwipeCards />} />
          <Route path="/posts" element={<StaticSwipeCards />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
