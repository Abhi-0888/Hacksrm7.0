"use client";

import React from "react";
import { motion } from "framer-motion";

export const GradientBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Background Noise */}
            <div className="noise-overlay absolute inset-0 z-0" />

            {/* Cinematic Radial Glows */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-quai-blue/10 blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-quai-red/5 blur-[120px]"
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full quai-gradient opacity-50" />
        </div>
    );
};
