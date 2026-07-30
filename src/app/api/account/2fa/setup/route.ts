import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Store it temporarily (not enabled yet)
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        two_factor_secret: secret,
        two_factor_enabled: false, // still disabled until verified
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Build otpauth URL
    const appName = 'YourAppName'; // change this
    const otpauth = authenticator.keyuri(
      user.email || user.id,
      appName,
      secret
    );

    // Generate QR as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    return NextResponse.json({
      success: true,
      secret,           // also show for manual entry
      qrCodeDataUrl,
      otpauth,
    });
  } catch (error: any) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start 2FA setup' },
      { status: 500 }
    );
  }
}