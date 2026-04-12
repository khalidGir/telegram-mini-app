import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: { label: string; onClick: () => void };
}

export default function Header({ title, showBack, rightAction }: HeaderProps) {
  const navigate = useNavigate();
  const { showBackButton, hideBackButton } = useTelegram();

  useEffect(() => {
    if (showBack) {
      showBackButton();
    } else {
      hideBackButton();
    }
  }, [showBack, showBackButton, hideBackButton]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {showBack && (
          <button className="app-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="app-header__title">{title}</h1>
        {rightAction && (
          <button className="app-header__action" onClick={rightAction.onClick}>
            {rightAction.label}
          </button>
        )}
      </div>
    </header>
  );
}
