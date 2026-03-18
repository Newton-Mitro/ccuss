import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
  small?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  text = 'Back',
  small = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        ${small ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-sm'}
        font-medium rounded-md
        border border-border
        bg-background text-foreground
        hover:bg-background/90 hover:shadow-sm
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/50
      `}
    >
      <ArrowLeft className={small ? 'h-4 w-4' : 'h-5 w-5'} />
      {text}
    </button>
  );
};

export default BackButton;
