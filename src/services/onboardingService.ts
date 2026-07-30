import supabase from '@/lib/supabase/client';
import { OnboardingStoreData } from '@/types';

/** Maximum allowed file size for verification video (e.g., 50 MB) */
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_MIME_TYPES = [
  "video/webm",
  "video/mp4",
  "video/quicktime",
  "video/ogg",
] 
const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour


export class OnboardingService {
 
  /**
   * Retrieves the currently authenticated Supabase user.
   * Throws if no active session is present.
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    return user;
  }

  /**
   * Fetch store data for the authenticated user.
   */
  static async getStoreData(userId: string) {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('global_market_stores')
      .select('is_verified, terms_accepted_at, contact_email, marketing_email, tiktok_handle, snapchat_handle, store_bio, verification_video_url')
      .eq('user_id', userId)
      .single();

    return { data, error };
  }

  /**
 * Securely uploads a verification video and generates a temporary signed URL.
 */
static async uploadVerificationVideo(
  userId: string,
  videoBlob: Blob
): Promise<string> {
  const user = await this.getCurrentUser();

  if (!user || user.id !== userId) {
    throw new Error(
      "Unauthorized: You can only upload verification media for your own account."
    );
  }

  // Input Validation Guard
  if (!videoBlob) {
    throw new Error("Invalid upload payload: Video blob is missing.");
  }

  if (videoBlob.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `File size exceeds limit of ${
        MAX_VIDEO_SIZE_BYTES / (1024 * 1024)
      }MB.`
    );
  }

  // Normalize MIME type (removes codec parameters)
  const mimeType = (videoBlob.type || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (!ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported video format: ${mimeType || "unknown"}`
    );
  }

  // Determine the correct file extension
  const extensionMap: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/quicktime": "mp4", // Store as .mp4 for consistency
  "video/ogg": "ogv",
};

  const extension = extensionMap[mimeType] ?? "webm";

  // Build secure storage path
  const sanitizedUserId = encodeURIComponent(userId);

  const filePath =
    `${sanitizedUserId}/verification_${Date.now()}.${extension}`;

  // Upload
  const { error: uploadError } = await supabase.storage
    .from("global_market_stores")
    .upload(filePath, videoBlob, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Video upload failed: ${uploadError.message}`
    );
  }

  // Generate temporary signed URL
  const { data, error: urlError } = await supabase.storage
    .from("global_market_stores")
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

  if (urlError || !data?.signedUrl) {
    throw new Error(
      `Failed to generate secure URL: ${
        urlError?.message ?? "Unknown error"
      }`
    );
  }

  return data.signedUrl;
}

  /**
   * Upserts store data safely tied to the authenticated user's session.
   */
  static async createOrUpdateStore(data: Partial<OnboardingStoreData>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: Cannot update store without an active session.');
    }

    const payload = {
      ...data,
      user_id: user.id, // Strictly bind payload ownership to active auth token
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('global_market_stores')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Store update failed: ${error.message}`);
    }
  }

  /**
   * Checks the status of the current user's store row.
   */
  static async checkStoreStatus(userId: string) {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('global_market_stores')
      .select('is_verified, terms_accepted_at, contact_email, marketing_email, tiktok_handle, snapchat_handle, store_bio')
      .eq('user_id', userId)
      .single();

    // PGRST116 = standard PostgREST error when zero rows are found
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to query store status: ${error.message}`);
    }

    return data ?? null;
  }

  /**
   * Clears onboarding progress tracking fields for the active session user.
   */
  static async clearOnboardingProgress(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: Session expired.');
    }

    const { error } = await supabase
      .from('global_market_stores')
      .update({
        onboarding_progress: null,
        onboarding_step: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to clear onboarding progress: ${error.message}`);
    }
  }
}