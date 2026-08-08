// app/account/referrals/page.tsx
import { Metadata } from 'next';
import { ReferralDashboard } from '@/components/referral/ReferralDashboard';

export const metadata: Metadata = {
  title: 'Referrals | Nu-vora',
  description: 'Invite friends and earn rewards',
};

export default function ReferralsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <ReferralDashboard />
    </div>
  );
}