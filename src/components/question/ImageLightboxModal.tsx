import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxModalProps {
  activeImage: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ activeImage, onClose }) => {
  return (
    <AnimatePresence>
      {activeImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white p-2"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-4 -right-4 bg-white text-slate-700 hover:text-rose-600 p-2 rounded-full shadow-lg transition-colors border border-slate-200"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};