import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface AuthResult {
  userId: string;
  telegramUserId: number;
  telegramUser: TelegramUser;
}

/**
 * Validates Telegram WebApp initData via HMAC-SHA256.
 * Returns parsed user info or null if invalid.
 */
export function verifyTelegramAuth(initData: string): AuthResult | null {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const sortedParams = Array.from(params.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(sortedParams)
    .digest('hex');

  if (computedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    const user: TelegramUser = JSON.parse(userRaw);
    return {
      userId: String(user.id),
      telegramUserId: user.id,
      telegramUser: user,
    };
  } catch {
    return null;
  }
}
