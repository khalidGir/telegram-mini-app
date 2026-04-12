import WebApp from '@twa-dev/sdk';
import type { TelegramUser } from '../types';

interface UseTelegramReturn {
  /** Telegram WebApp instance */
  WebApp: typeof WebApp;
  /** Current Telegram user from initDataUnsafe */
  user: TelegramUser | null;
  /** Raw initData string (for backend auth) */
  initData: string;
  /** Whether we're running inside Telegram */
  isTelegram: boolean;
  /** Ready signal — call when UI is rendered */
  ready: () => void;
  /** Expand the mini app to full height */
  expand: () => void;
  /** Close the mini app */
  close: () => void;
  /** Show/hide the BackButton */
  showBackButton: () => void;
  hideBackButton: () => void;
  /** Set MainButton text and handler */
  setMainButton: (text: string, onClick: () => void) => void;
  /** Hide MainButton */
  hideMainButton: () => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: typeof WebApp };
  }
}

export function useTelegram(): UseTelegramReturn {
  const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;

  if (isTelegram) {
    WebApp.ready();
  }

  return {
    WebApp,
    user: WebApp.initDataUnsafe?.user ?? null,
    initData: WebApp.initData || '',
    isTelegram,
    ready: () => WebApp.ready(),
    expand: () => WebApp.expand(),
    close: () => WebApp.close(),
    showBackButton: () => WebApp.BackButton.show(),
    hideBackButton: () => WebApp.BackButton.hide(),
    setMainButton: (text: string, onClick: () => void) => {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    },
    hideMainButton: () => WebApp.MainButton.hide(),
  };
}
