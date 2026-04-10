import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Approvals from './pages/Approvals';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/products" element={<Products />} />
          {/* Add more routes as the portal grows */}
          <Route path="*" element={<Dashboard />} /> 
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
