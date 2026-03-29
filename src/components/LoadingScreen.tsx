import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isVisible: boolean;
}

export function LoadingScreen({ isVisible }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          /* O próprio container da tela branca não tem animação de entrada, 
             pois queremos que ele apareça imediatamente assim que clicamos no link */
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 bg-white z-[99999] flex items-center justify-center overflow-hidden"
        >
          <motion.img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
            alt="Goiás Minas Uniformes"
            className="w-48 md:w-64 h-auto object-contain origin-center"
            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1.2, 1.2], 
              rotateY: [90, 0, 0, 0] 
            }}
            transition={{ 
              duration: 2.5, 
              times: [0, 0.3, 0.8, 1], 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
