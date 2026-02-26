"use client";

import React from "react";
import { Web3Provider } from "@/providers/Web3Provider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppProvider } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <Web3Provider>
                    <AppProvider>
                        {children}
                    </AppProvider>
                </Web3Provider>
            </QueryClientProvider>
        </AuthProvider>
    );
}
