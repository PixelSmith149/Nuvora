import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, action } = await request.json(); // action: 'enable' | 'disable'

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Fetch current secret
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA is not set up. Please start setup first.' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code.replace(/\s/g, ''),
      secret: profile.two_factor_secret,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authenticator code' }, { status: 400 });
    }

    if (action === 'disable') {
      // Disable 2FA
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null, // clear the secret
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication disabled',
        twoFactorEnabled: false,
      });
    }

    // Default: enable
    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled',
      twoFactorEnabled: true,
    });
  } catch (error: any) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}