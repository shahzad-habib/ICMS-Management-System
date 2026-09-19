import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import Login from './pages/auth/Login';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import LeaveRequests from './pages/teacher/LeaveRequests';
import TeacherProfile from './pages/teacher/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import LeaveManagement from './pages/admin/LeaveManagement';
import Settings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Teacher Routes — wrapped in TeacherLayout */}
            <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
              <Route element={<TeacherLayout />}>
                <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/attendance" element={<AttendanceHistory />} />
                <Route path="/teacher/leaves" element={<LeaveRequests />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
              </Route>
            </Route>
            
            {/* Admin Routes — wrapped in AdminLayout */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard"  element={<AdminDashboard />} />
                <Route path="/admin/teachers"   element={<TeacherManagement />} />
                <Route path="/admin/attendance" element={<AttendanceLogs />} />
                <Route path="/admin/leaves"     element={<LeaveManagement />} />
                <Route path="/admin/settings"   element={<Settings />} />
                <Route path="/admin/profile"    element={<AdminProfile />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
