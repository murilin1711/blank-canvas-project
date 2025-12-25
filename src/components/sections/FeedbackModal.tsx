'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para deixar um feedback');
      return;
    }

    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('O comentário deve ter pelo menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedbacks').insert({
        user_id: user.id,
        user_name: user.email?.split('@')[0] || 'Usuário',
        rating,
        comment: comment.trim()
      });

      if (error) throw error;

      toast.success('Obrigado pelo seu feedback!');
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#2e3091] mb-2">
            Deixe seu Feedback
          </h2>
          <p className="text-gray-600 text-sm">
            Sua opinião é muito importante para nós!
          </p>
        </div>

        {!user ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para deixar um feedback.
            </p>
            <a
              href="/auth"
              className="inline-block bg-[#2e3091] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#252a7a] transition-colors"
            >
              Fazer Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sua avaliação
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Seu comentário
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos sobre sua experiência..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091] resize-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500 caracteres
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-[#2e3091] text-white py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
