
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const TIKTOK_REGEX = /^(?!.*\.$)[a-zA-Z0-9._]{2,24}$/;
export const SNAPCHAT_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]{1,13}[a-zA-Z0-9]$/;
export const sanitizeHandle = (handle: string): string => {
  const trimmed = handle.trim();
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

export const validateTikTokHandle = (handle: string): boolean => {
  if (!handle || typeof handle !== 'string') return false;
  const cleanHandle = sanitizeHandle(handle);
  return TIKTOK_REGEX.test(cleanHandle);
};

export const validateSnapchatHandle = (handle: string): boolean => {
  if (!handle || typeof handle !== 'string') return false;
  const cleanHandle = sanitizeHandle(handle);
  return SNAPCHAT_REGEX.test(cleanHandle);
};

// Step Validation Guards

export const canProceedToInfo = (state: { ageConfirmed?: boolean }): boolean => {
  return state?.ageConfirmed === true;
};

export const canProceedToBiometric = (state: {
  contactEmail?: string;
  marketingEmail?: string;
  tiktok?: string;
  snapchat?: string;
}): boolean => {
  if (!state) return false;

  return (
    validateEmail(state.contactEmail ?? '') &&
    validateEmail(state.marketingEmail ?? '') &&
    validateTikTokHandle(state.tiktok ?? '') &&
    validateSnapchatHandle(state.snapchat ?? '')
  );
};

export const canProceedToTerms = (biometricState: { recordingState?: string }): boolean => {
  return biometricState?.recordingState === 'done';
};

export const canProceedToSuccess = (state: { termsAccepted?: boolean }): boolean => {
  return state?.termsAccepted === true;
};