import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CreateCatalogPage from './pages/CreateCatalogPage.jsx';
import EditCatalogPage from './pages/EditCatalogPage.jsx';

import CartPage from './pages/CartPage.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path='/home' element={ <ProtectedRoute>
              <Home />
            </ProtectedRoute>}/>
       
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateCatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditCatalogPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
         </Routes>
      </div>
    </Router>
  );
}

export default App;