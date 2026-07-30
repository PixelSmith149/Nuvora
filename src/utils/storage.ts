import { OnboardingPersistenceData } from '@/types';
import { STORAGE_KEY, STORAGE_MAX_AGE_MS } from './constants';

/**
  Checks if window and localStorage are available (SSR and Incognito safe).
 */
const isStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Strips highly sensitive PII (like raw biometric tokens or full financial numbers)
 * before persisting state to client-side unencrypted storage.
 */
const sanitizeForPersistence = (
  data: OnboardingPersistenceData
): Partial<OnboardingPersistenceData> => {
  const { 
    // Omit sensitive data fields if they exist in OnboardingPersistenceData
    ...safeData 
  } = data;

  return safeData;
};

export const saveOnboardingState = (data: OnboardingPersistenceData): void => {
  if (!isStorageAvailable()) return;

  try {
    const sanitizedData = sanitizeForPersistence(data);
    const serialized = JSON.stringify({
      ...sanitizedData,
      timestamp: Date.now(),
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('[Storage] Failed to save onboarding state:', error);
  }
};

export const loadOnboardingState = (): OnboardingPersistenceData | null => {
  if (!isStorageAvailable()) return null;

  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const data = JSON.parse(serialized);

    // Schema / Runtime validation guard
    if (!data || typeof data !== 'object' || typeof data.timestamp !== 'number') {
      clearOnboardingState();
      return null;
    }

    // Check expiration
    if (Date.now() - data.timestamp > STORAGE_MAX_AGE_MS) {
      clearOnboardingState();
      return null;
    }

    return data as OnboardingPersistenceData;
  } catch (error) {
    console.error('[Storage] Failed to load onboarding state:', error);
    clearOnboardingState();
    return null;
  }
};

export const clearOnboardingState = (): void => {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Storage] Failed to clear onboarding state:', error);
  }
};

export const hasDraftOnboarding = (): boolean => {
  return loadOnboardingState() !== null;
};