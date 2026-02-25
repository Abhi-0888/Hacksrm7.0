import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, RefreshCw } from 'lucide-react';

interface PosterUploadProps {
  value?: string;              // preview URL (controlled)
  onChange: (file: File, previewUrl: string) => void;
  onRemove?: () => void;
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function PosterUpload({ value, onChange, onRemove }: PosterUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return 'Invalid file type. Please use PNG, JPG, or WEBP.';
    if (file.size > MAX_BYTES) return 'File too large. Maximum size is 5 MB.';
    return null;
  };

  const processFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    onChange(file, url);
  }, [onChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so the same file can be re-selected
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
    <div className="flex flex-col gap-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFileInput}
        className="sr-only"
        aria-label="Upload event poster"
        tabIndex={-1}
      />

      {/* Upload / Preview container */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={hasPoster ? 'Replace event poster' : 'Upload event poster'}
        aria-describedby="poster-upload-hint"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="relative aspect-square w-full sm:w-48 md:w-52 rounded-2xl overflow-hidden cursor-pointer select-none outline-none transition-all duration-200"
        style={{
          background: hasPoster ? 'transparent' : 'rgba(10,10,18,0.8)',
          border: `2px dashed ${
            dragOver
              ? 'rgba(168,85,247,0.8)'
              : error
              ? 'rgba(248,113,113,0.5)'
              : hasPoster
              ? 'rgba(168,85,247,0.3)'
              : 'rgba(168,85,247,0.2)'
          }`,
          boxShadow: dragOver
            ? '0 0 28px rgba(168,85,247,0.3)'
            : hasPoster
            ? '0 0 20px rgba(168,85,247,0.12)'
            : 'none',
        }}
        whileHover={{ boxShadow: '0 0 24px rgba(168,85,247,0.25)' }}
        whileFocus={{ outline: '2px solid #a855f7', outlineOffset: 2 }}
        animate={{
          borderColor: dragOver
            ? 'rgba(168,85,247,0.8)'
            : error
            ? 'rgba(248,113,113,0.5)'
            : hasPoster
            ? 'rgba(168,85,247,0.3)'
            : 'rgba(168,85,247,0.2)',
        }}
      >
        <AnimatePresence mode="wait">
          {hasPoster ? (
            /* ── Preview state ── */
            <motion.div
              key="preview"
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <img
                src={value}
                alt="Event poster preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
              >
                <RefreshCw className="w-6 h-6 text-white" />
                <span className="text-xs font-semibold text-white">Replace</span>
              </div>

              {/* Remove (X) button */}
              <motion.button
                onClick={handleRemove}
                aria-label="Remove poster"
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }}
                whileHover={{ scale: 1.15, background: '#dc2626', color: '#fff' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ) : (
            /* ── Empty / drag-over state ── */
            <motion.div
              key="empty"
              className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: dragOver ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
                animate={{ scale: dragOver ? 1.1 : 1 }}
                transition={{ duration: 0.15 }}
              >
                {dragOver
                  ? <ImageIcon className="w-6 h-6" style={{ color: '#c084fc' }} />
                  : <Upload className="w-6 h-6" style={{ color: '#a855f7' }} />
                }
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: dragOver ? '#c084fc' : '#d1d5db' }}>
                  {dragOver ? 'Drop to upload' : 'Upload Event Poster'}
                </p>
                <p className="text-[0.7rem] mt-1" style={{ color: '#4a4a5e' }} id="poster-upload-hint">
                  PNG, JPG, WEBP · Max 5 MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* File name */}
      <AnimatePresence>
        {fileName && !error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[0.7rem] truncate max-w-[208px]"
            style={{ color: '#6b7280', fontFamily: "'Inter',sans-serif" }}
          >
            📎 {fileName}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium"
            style={{ color: '#f87171' }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
