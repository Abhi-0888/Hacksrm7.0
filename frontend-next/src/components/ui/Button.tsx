"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    glow?: boolean;
}

const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 border border-primary/20",
    secondary: "bg-surface text-white border border-white/10 hover:bg-white/5",
    ghost: "bg-transparent text-white hover:bg-white/5 border border-transparent",
};

const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
};

export const Button = ({
    className,
    variant = "primary",
    size = "md",
    glow = false,
    ...props
}: ButtonProps) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative rounded-full font-medium transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                glow && "glow-shadow ring-1 ring-primary/30",
                className
            )}
            {...(props as any)}
        />
    );
};
