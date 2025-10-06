// context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type User = {
    loggedIn: boolean;
    userId: string;
    username: string;
};

type RegisterCredentials = {
    username: string;
    email: string;
    password: string;
};

type LoginCredentials = {
    email: string;
    password: string;
};

type AuthContextType = {
    user: User;
    loading: boolean;
    error: string | null;
    register: ({ username, email, password }: RegisterCredentials) => Promise<void>;
    login: ({ email, password }: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: {
        loggedIn: false,
        userId: '',
        username: 'Guest',
    },
    loading: true,
    error: '',
    register: async () => {},
    login: async () => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>('');
    const [user, setUser] = useState<User>({
        loggedIn: false,
        userId: '',
        username: 'Guest',
    });

    const fetchUser = async () => {
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-user`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                setUser({
                    loggedIn: true,
                    userId: data.data.user_id,
                    username: data.data.username,
                });
                setError(null);
            } else {
                await refreshToken();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                await fetchUser();
                setError(null);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const register = async ({ username, email, password }: RegisterCredentials) => {
        if (!username || !email || !password) {
            setError('All fields required');
            throw new Error('All fields required');
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
            await fetchUser();
            setError(null);
        } else {
            setError(data.message);
            throw new Error(data.message);
        }
    };

    const login = async ({ email, password }: LoginCredentials) => {
        if (!email || !password) {
            setError('All fields required');
            throw new Error('All fields required');
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
            await fetchUser();
            setError(null);
        } else {
            setError(data.message);
            throw new Error(data.message);
        }
    };

    const logout = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
            setUser({
                loggedIn: false,
                userId: '',
                username: 'Guest',
            });
            setError(null);
        } else {
            setError(data.message);
            throw new Error(data.message);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
