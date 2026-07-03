import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import DepartmentsPage from './pages/Departments/DepartmentsPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import LeavesPage from './pages/Leaves/LeavesPage';
import PayrollPage from './pages/Payroll/PayrollPage';
import UsersPage from './pages/Users/UsersPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import MyProfilePage from './pages/Profile/MyProfilePage';
import MyPayslipsPage from './pages/Payroll/MyPayslipsPage';
import ChangePasswordPage from './pages/Profile/ChangePasswordPage';
import { Toaster } from 'sonner';
import LandingPage from './pages/Landing/LandingPage';
import ResetPasswordPage from './pages/ResetPassword/ResetPasswordPage';

function RootRoute() {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            Loading...
        </div>
    );
    if (!user) return <LandingPage />;

    if (user.role === 'EMPLOYEE') return <Navigate to="/my-profile" replace />;
    if (user.role === 'HR_MANAGER') return <Navigate to="/employees" replace />;
    return <Navigate to="/dashboard" replace />;
}

function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <Toaster richColors position="top-right" />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <DashboardLayout>
                                    <DashboardPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employees"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <EmployeesPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/departments"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <DepartmentsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <AttendancePage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leaves"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <LeavesPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payroll"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <PayrollPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <DashboardLayout>
                                    <UsersPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN', 'HR_MANAGER']}>
                                <DashboardLayout>
                                    <ReportsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute roles={['SUPER_ADMIN']}>
                                <DashboardLayout>
                                    <SettingsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-profile"
                        element={
                            <ProtectedRoute roles={['EMPLOYEE']}>
                                <DashboardLayout>
                                    <MyProfilePage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-payslips"
                        element={
                            <ProtectedRoute roles={['EMPLOYEE']}>
                                <DashboardLayout>
                                    <MyPayslipsPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <ChangePasswordPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<RootRoute />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;