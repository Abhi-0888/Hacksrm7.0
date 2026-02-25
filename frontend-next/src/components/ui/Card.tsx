"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverGlow?: boolean;
}

export const Card = ({ children, className, hoverGlow = true }: CardProps) => {
    return (
        <motion.div
            whileHover={hoverGlow ? { scale: 1.02, y: -5 } : {}}
            className={cn(
                "relative p-8 rounded-3xl glass transition-all duration-500 overflow-hidden group",
                hoverGlow && "hover:border-primary/40 hover:glow-shadow",
                className
            )}
        >
            <div className="relative z-10">{children}</div>

            {/* Dynamic Hover Glow */}
            {hoverGlow && (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
        </motion.div>
    );
};

export const FeatureCard = ({
    title,
    description,
    icon: Icon,
    className,
}: {
    title: string;
    description: string;
    icon: any;
    className?: string;
}) => {
    return (
        <Card className={className}>
            <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
            <p className="text-muted text-sm leading-relaxed">{description}</p>
        </Card>
    );
};
