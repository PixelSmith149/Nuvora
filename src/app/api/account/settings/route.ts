import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use maybeSingle() to avoid PGRST116 error if profile doesn't exist yet
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('language, email_notifications, push_notifications, theme, two_factor_enabled')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: {
        language: profile?.language || 'en',
        theme: profile?.theme || 'dark',
        emailNotifications: profile?.email_notifications !== false,
        pushNotifications: profile?.push_notifications !== false,
        twoFactorEnabled: profile?.two_factor_enabled || false,
      },
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { language, theme, emailNotifications, pushNotifications } = body;

    const updates: Record<string, any> = {
      id: user.id, // Included for upsert capability
      updated_at: new Date().toISOString(),
    };

    if (language !== undefined) updates.language = language;
    if (theme !== undefined) updates.theme = theme;
    if (emailNotifications !== undefined) updates.email_notifications = emailNotifications;
    if (pushNotifications !== undefined) updates.push_notifications = pushNotifications;

    // Use upsert to handle new profiles cleanly
    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}