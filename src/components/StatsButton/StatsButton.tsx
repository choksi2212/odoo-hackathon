
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatsButtonProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

const StatsButton: React.FC<StatsButtonProps> = ({
  icon: Icon,
  label,
  value,
  onClick,
  variant = 'ghost'
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted/50 transition-colors"
    >
      <Icon className="h-5 w-5 text-primary" />
      <div className="text-center">
        <div className="text-lg font-semibold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Button>
  );
};

export default StatsButton;
