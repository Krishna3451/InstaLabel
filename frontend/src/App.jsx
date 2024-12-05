import React from 'react';
import CameraView from './components/CameraView';
import HomePage from './pages/HomePage';
import RecentScansPage from './pages/RecentScansPage';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
function App() {
  return (
<Router>
<div className="h-screen w-screen bg-black">
     <Routes>
          <Route path="/" element={<CameraView />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/recent-scans" element={<RecentScansPage />} />
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </div>
    </Router>

      
  );
}

export default App;