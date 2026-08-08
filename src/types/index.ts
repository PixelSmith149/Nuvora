export type Step = 'welcome' | 'financial' | 'info' | 'biometric' | 'terms' | 'success';

export interface OnboardingState {
  currentStep: Step;
  ageConfirmed: boolean;
  contactEmail: string;
  marketingEmail: string;
  tiktok: string;
  snapchat: string;
  storeBio: string;
  termsAccepted: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export type ChallengePhase =
  | 'none'
  | 'center'
  | 'look_left'
  | 'look_right'
  | 'look_center_final'
  | 'passed';

export interface BiometricState {
  isDesktop: boolean;
  recordingState: 'idle' | 'initializing' | 'detecting' | 'recording' | 'done';
  recordingTime: number;
  faceDetected: boolean;
  videoBlob: Blob | null;
  error: string | null;
  // New fields for proper liveness challenges
  challenge: ChallengePhase;
  challengeInstruction: string | null;
}

export interface OnboardingStoreData {
  user_id: string;
  contact_email: string;
  marketing_email: string;
  tiktok_handle: string;
  snapchat_handle: string;
  verification_video_url: string;
  store_bio: string | null;
  is_verified: boolean;
  terms_accepted_at: string;
  updated_at: string;
}

export interface OnboardingPersistenceData {
  step: Step;
  state: OnboardingState;
  biometricState: BiometricState;
  timestamp: number;
}

export interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
  validate?: (state: OnboardingState) => boolean;
}