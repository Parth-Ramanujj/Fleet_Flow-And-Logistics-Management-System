import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// ─── Dummy User Store: persisted in localStorage ────────────────────────────
const STORE_KEY = 'fleetflow_users';
const SESSION_KEY = 'fleetflow_session';

const ROLE_DEFAULTS = {
    manager: { label: 'Fleet Manager', email_suffix: 'manager' },
    dispatcher: { label: 'Trip Dispatcher', email_suffix: 'dispatcher' },
    safety: { label: 'Safety Officer', email_suffix: 'safety' },
    finance: { label: 'Financial Analyst', email_suffix: 'finance' },
};

function getUsers() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
}

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

// ─────────────────────────────────────────────────────────────────────────────

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
        await new Promise(resolve => setTimeout(resolve, 2000));
        const users = getUsers();

        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { error: { message: 'An account with this email already exists.' } };
        }

        const newUser = {
            id: `usr_${Date.now()}`,
            email,
            password, // plaintext — dummy only, never do this in production
            fullName,
            role,
            createdAt: new Date().toISOString(),
        };

        saveUsers([...users, newUser]);

        // Auto-login after register
        const sessionUser = { id: newUser.id, email: newUser.email };
        const sessionProfile = { full_name: newUser.fullName, role: newUser.role };
        setUser(sessionUser);
        setProfile(sessionProfile);
        saveSession({ user: sessionUser, profile: sessionProfile });

        return { error: null };
    };

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = async ({ email, password }) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const users = getUsers();
        const found = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!found) {
            return { error: { message: 'Invalid email or password. Please try again.' } };
        }

        const sessionUser = { id: found.id, email: found.email };
        const sessionProfile = { full_name: found.fullName, role: found.role };
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
