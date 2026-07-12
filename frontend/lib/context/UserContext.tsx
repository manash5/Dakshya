"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserInfoCookie } from "../cookies";

interface UserContextProps {
    onboardingCompleted: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
    markOnboardingComplete: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [onboardingCompleted, setOnboardingCompleted] = useState(true); // default true so overlay doesn't flash for admins/unknowns
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const userInfo = await getUserInfoCookie();
            if (userInfo && userInfo.role === "user") {
                setOnboardingCompleted(!!userInfo.onboardingCompleted);
            } else {
                // Admins (or missing user info) never see onboarding
                setOnboardingCompleted(true);
            }
        } catch (err) {
            setOnboardingCompleted(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const markOnboardingComplete = () => setOnboardingCompleted(true);

    return (
        <UserContext.Provider
            value={{ onboardingCompleted, loading, refreshUser, markOnboardingComplete }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};