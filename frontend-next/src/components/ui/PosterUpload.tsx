"use client";

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PosterUploadProps {
    value?: string;              // preview URL (controlled)
    onChange: (file: File, previewUrl: string) => void;
    onRemove?: () => void;
    className?: string;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function PosterUpload({ value, onChange, onRemove, className }: PosterUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const validate = (file: File): string | null => {
        if (!ACCEPTED.includes(file.type)) return 'INVALID_FILE_TYPE: PLEASE USE PNG, JPG, OR WEBP';
        if (file.size > MAX_BYTES) return 'FILE_TOO_LARGE: MAX 5MB';
        return null;
    };

    const processFile = useCallback((file: File) => {
        const err = validate(file);
        if (err) { setError(err); return; }
        setError(null);
        setFileName(file.name);
        if (value) URL.revokeObjectURL(value);
        const url = URL.createObjectURL(file);
        onChange(file, url);
    }, [onChange, value]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        setError(null);
        onRemove?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const hasPoster = !!value;

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                onChange={handleFileInput}
                className="sr-only"
                aria-label="Upload event poster"
                tabIndex={-1}
            />

            <motion.div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={handleKeyDown}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative aspect-square w-full sm:w-48 overflow-hidden cursor-pointer border transition-all duration-300",
                    dragOver ? "border-primary bg-primary/5" : "border-primary/20 bg-bg2/50",
                    hasPoster ? "border-solid" : "border-dashed"
                )}
                whileHover={{ borderColor: 'rgba(180,245,0,0.5)', scale: 1.02 }}
                animate={{
                    borderColor: dragOver ? 'var(--primary)' : error ? 'var(--danger)' : hasPoster ? 'rgba(180,245,0,0.3)' : 'rgba(180,245,0,0.2)'
                }}
            >
                <AnimatePresence mode="wait">
                    {hasPoster ? (
                        <motion.div
                            key="preview"
                            className="w-full h-full relative group"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <img src={value} alt="Poster" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCw size={24} className="text-primary animate-spin-slow" />
                                <span className="font-mono text-[0.6rem] text-primary uppercase tracking-widest">Replace</span>
                            </div>
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 bg-background border border-primary/20 text-muted hover:text-danger hover:border-danger transition-colors z-10"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className={cn(
                                "w-12 h-12 flex items-center justify-center border border-primary/20",
                                dragOver ? "bg-primary/20" : "bg-primary/5"
                            )}>
                                {dragOver ? <ImageIcon size={20} className="text-primary" /> : <Upload size={20} className="text-primary" />}
                            </div>
                            <div className="text-center">
                                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-foreground">
                                    {dragOver ? 'Drop_File' : 'Upload_Poster'}
                                </p>
                                <p className="font-mono text-[0.55rem] text-muted mt-1 uppercase">
                                    PNG_JPG_WEBP
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {(fileName || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                    >
                        {error ? (
                            <AlertCircle size={12} className="text-danger" />
                        ) : (
                            <div className="w-1 h-1 rounded-full bg-primary" />
                        )}
                        <span className={cn(
                            "font-mono text-[0.6rem] uppercase truncate",
                            error ? "text-danger" : "text-muted"
                        )}>
                            {error || fileName}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
