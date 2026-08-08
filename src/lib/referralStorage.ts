// src/lib/referralStorage.ts
export interface StoredReferral {
  code: string;
  type: 'publish' | 'boost' | 'build';
  timestamp: number;
}

const REFERRAL_KEY = 'pending_referral_data';
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

export const saveReferralContext = (code: string, type: string) => {
  if (typeof window === 'undefined') return;
  const validTypes = ['publish', 'boost', 'build'];
  const sanitizedType = validTypes.includes(type) ? type : 'publish';

  const data: StoredReferral = {
    code,
    type: sanitizedType as StoredReferral['type'],
    timestamp: Date.now(),
  };

  localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
  // Set cookie for server-side middleware or callback reading
  document.cookie = `${REFERRAL_KEY}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=604800; SameSite=Lax`;
};

export const getStoredReferral = (): StoredReferral | null => {
  if (typeof window === 'undefined') return null;
  
  const item = localStorage.getItem(REFERRAL_KEY);
  if (!item) return null;

  try {
    const data: StoredReferral = JSON.parse(item);
    if (Date.now() - data.timestamp > EXPIRATION_MS) {
      clearStoredReferral();
      return null;
    }
    return data;
  } catch {
    clearStoredReferral();
    return null;
  }
};

export const clearStoredReferral = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_KEY);
  document.cookie = `${REFERRAL_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};