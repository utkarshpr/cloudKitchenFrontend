import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CreateCatalogPage from './pages/CreateCatalogPage.jsx';
import EditCatalogPage from './pages/EditCatalogPage.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LoginPage />} />
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
         </Routes>
      </div>
    </Router>
  );
}

export default App;