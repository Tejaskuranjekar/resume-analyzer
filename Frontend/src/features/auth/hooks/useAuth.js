
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });

            if (!data?.user) {
                setUser(null);
                return false;
            }

            setUser(data.user);
            return true;
        } catch (err) {
            setUser(null);
            console.error("Login failed:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);

        try {
            const data = await register({ username, email, password });

            if (!data?.user) {
                return false;
            }

            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Registration failed:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            setUser(null);
            return true;
        } catch (err) {
            console.error("Logout failed:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        const getAndSetUser = async () => {
            try {
                const data = await getMe();

                if (active) {
                    setUser(data?.user ?? null);
                }
            } catch (err) {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        getAndSetUser();

        return () => {
            active = false;
        };
    }, [setUser, setLoading]);

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
    };
};
