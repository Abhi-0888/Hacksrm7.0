"use client";

import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setClicked(true);
        const handleMouseUp = () => setClicked(false);

        const handleLinkHoverStart = () => setLinkHovered(true);
        const handleLinkHoverEnd = () => setLinkHovered(false);

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const interactables = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
        interactables.forEach((el) => {
            el.addEventListener('mouseenter', handleLinkHoverStart);
            el.addEventListener('mouseleave', handleLinkHoverEnd);
        });

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            interactables.forEach((el) => {
                el.removeEventListener('mouseenter', handleLinkHoverStart);
                el.removeEventListener('mouseleave', handleLinkHoverEnd);
            });
        };
    }, []);

    return (
        <>
            <div
                id="cur"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `translate(-50%, -50%) scale(${clicked ? 0.8 : 1})`,
                }}
                className="transition-transform duration-100"
            />
            <div
                id="cur-ring"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: linkHovered ? '48px' : '34px',
                    height: linkHovered ? '48px' : '34px',
                    borderColor: linkHovered ? 'rgba(180, 245, 0, 1)' : 'rgba(180, 245, 0, 0.5)',
                }}
            />
        </>
    );
};
