import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('payflow_user');
        const storedToken = localStorage.getItem('payflow_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    async function login(email, password) {
        const res = await authApi.login(email, password);
        if (res.success) {
            localStorage.setItem('payflow_token', res.token);
            localStorage.setItem('payflow_user', JSON.stringify(res.user));
            setUser(res.user);
        }
        return res;
    }

    function logout() {
        localStorage.removeItem('payflow_token');
        localStorage.removeItem('payflow_user');
        setUser(null);
        window.location.href = '/login';
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}