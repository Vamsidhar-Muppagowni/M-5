import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmingHelp from './pages/farmingHelp';
import Payments from './pages/payments';
import Schemes from './pages/schemes';
import AddCrop from './pages/AddCrop';
import ForgotPassword from './pages/ForgotPassword';
import PriceHelp from './pages/pricehelp';
import Profile from './pages/Profile';

// Component to protect routes based on authentication and roles
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-emerald-600">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to dashboard if user doesn't have permission
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/marketplace"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin']}>
                                    <Marketplace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/add-crop"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                                    <AddCrop />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/farming-help"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                                    <FarmingHelp />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                                    <Payments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/schemes"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                                    <Schemes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/price-help"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                                    <PriceHelp />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin']}>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider >
    );
}

export default App;
