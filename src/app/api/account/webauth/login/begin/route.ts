// app/api/account/webauthn/login/begin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

const loginChallengeStore = new Map<string, { challenge: string; userId: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (userId !== user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // ─── Get user's passkeys ────────────────────────────────────────────
    const { data: passkeys, error: passkeyError } = await supabase
      .from('passkeys')
      .select('credential_id')
      .eq('user_id', user.id);

    if (passkeyError) {
      console.error('Failed to fetch passkeys:', passkeyError);
      return NextResponse.json(
        { error: 'Failed to fetch passkeys' },
        { status: 500 }
      );
    }

    const challenge = generateChallenge();
    const rpId = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost';

    loginChallengeStore.set(user.id, {
      challenge,
      userId: user.id,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // ─── Clean up expired challenges ──────────────────────────────────
    for (const [key, value] of loginChallengeStore.entries()) {
      if (value.expiresAt < Date.now()) {
        loginChallengeStore.delete(key);
      }
    }

    const options = {
      challenge,
      rpId,
      allowCredentials: passkeys?.map((p: any) => ({
        type: 'public-key',
        id: p.credential_id,
      })) || [],
      timeout: 60000,
      userVerification: 'preferred',
    };

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('WebAuthn login begin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start passkey login' },
      { status: 500 }
    );
  }
}

export { loginChallengeStore };