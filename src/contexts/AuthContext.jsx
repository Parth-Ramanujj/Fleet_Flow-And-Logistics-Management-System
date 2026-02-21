import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = 'fleetflow_session';

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

function saveSession(sessionData) {
    if (sessionData) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

const ROLE_DEFAULTS = {
    manager: { label: 'Fleet Manager', email_suffix: 'manager' },
    dispatcher: { label: 'Trip Dispatcher', email_suffix: 'dispatcher' },
    safety: { label: 'Safety Officer', email_suffix: 'safety' },
    finance: { label: 'Financial Analyst', email_suffix: 'finance' },
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on page reload
    useEffect(() => {
        const saved = getSession();
        if (saved) {
            setUser(saved.user);
            setProfile(saved.profile);
        }
        setLoading(false);
    }, []);

    // ── Register ──────────────────────────────────────────────────────────────
    const register = async ({ fullName, email, password, role }) => {
        // 1. Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .ilike('email', email)
            .maybeSingle();

        if (existingUser) {
            return { error: { message: 'An account with this email already exists.' } };
        }

        // 2. Insert new user into custom public.users table
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ email, password, full_name: fullName, role }])
            .select()
            .single();

        if (error) {
            return { error };
        }

        // 3. Auto-login after register
        const sessionUser = { id: newUser.id, email: newUser.email };
        const sessionProfile = { full_name: newUser.full_name, role: newUser.role };

        setUser(sessionUser);
        setProfile(sessionProfile);
        saveSession({ user: sessionUser, profile: sessionProfile });

        return { error: null };
    };

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = async ({ email, password }) => {
        // Query custom public.users table
        const { data: foundUser, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .eq('password', password) // Validating plaintext password
            .maybeSingle();

        if (error || !foundUser) {
            return { error: { message: 'Invalid email or password. Please try again.' } };
        }

        const sessionUser = { id: foundUser.id, email: foundUser.email };
        const sessionProfile = { full_name: foundUser.full_name, role: foundUser.role };

        setUser(sessionUser);
        setProfile(sessionProfile);
        saveSession({ user: sessionUser, profile: sessionProfile });

        return { error: null };
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = async () => {
        setUser(null);
        setProfile(null);
        saveSession(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            login,
            logout,
            register,
            ROLE_DEFAULTS,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
