import React from "react";
import Navigation from "./Navigation";
import { AuthProvider } from "./AuthContext";  // ✅ Import AuthProvider

export default function App() {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
}
