import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

export function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes gm-logo-enter {
          0%   { opacity: 0; transform: scale(0.5) rotateY(90deg); }
          30%  { opacity: 1; transform: scale(1.2) rotateY(0deg); }
          80%  { opacity: 1; transform: scale(1.2) rotateY(0deg); }
          100% { opacity: 0; transform: scale(1.2) rotateY(0deg); }
        }
      `}</style>
      <div
        className="fixed inset-0 bg-white z-[99999] flex items-center justify-center overflow-hidden"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
          alt="Goiás Minas Uniformes"
          className="w-48 md:w-64 h-auto object-contain origin-center"
          style={{ animation: isVisible ? 'gm-logo-enter 2.5s ease-in-out forwards' : 'none' }}
        />
      </div>
    </>
  );
}
