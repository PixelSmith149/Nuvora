'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, AtSign, MessageSquare, FileText, UserCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MAX_STORE_BIO_LENGTH } from '@/utils/constants';
import { fadeInUp, staggerContainer } from '@/utils/animations';

interface InfoStepProps {
  contactEmail: string;
  marketingEmail: string;
  tiktok: string;
  snapchat: string;
  storeBio: string;
  onUpdate: (updates: Partial<InfoStepProps>) => void;
}

export function InfoStep({
  contactEmail,
  marketingEmail,
  tiktok,
  snapchat,
  storeBio,
  onUpdate,
}: InfoStepProps) {
  const maxBioLength = MAX_STORE_BIO_LENGTH || 250;
  const bioProgress = Math.min(100, (storeBio.length / maxBioLength) * 100);

  // Helper to strip extra @ symbols if user types them repeatedly
  const sanitizeHandle = (val: string) => val.replace(/^@+/, '');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 select-none"
    >
      {/* --- STEP HEADER --- */}
      <motion.div variants={fadeInUp} className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Merchant Identity</span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Profile & Channels
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Configure primary operational emails and social creator profiles to build merchant trust.
        </p>
      </motion.div>

      {/* --- FORM FIELDS CONTAINER --- */}
      <motion.div variants={staggerContainer} className="space-y-4">
        {/* EMAIL FIELDS GRID */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Contact Email */}
          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-emerald-400" />
              Operational Email *
            </Label>
            <div className="relative rounded-xl bg-black border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => onUpdate({ contactEmail: e.target.value })}
                className="bg-transparent border-0 text-white placeholder:text-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                placeholder="operations@brand.com"
              />
            </div>
          </div>

          {/* Marketing Email */}
          <div className="space-y-1.5">
            <Label htmlFor="marketing-email" className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-cyan-400" />
              Marketing & Billing *
            </Label>
            <div className="relative rounded-xl bg-black border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
              <Input
                id="marketing-email"
                type="email"
                value={marketingEmail}
                onChange={(e) => onUpdate({ marketingEmail: e.target.value })}
                className="bg-transparent border-0 text-white placeholder:text-zinc-600 rounded-xl h-10 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                placeholder="press@brand.com"
              />
            </div>
          </div>
        </motion.div>

        {/* SOCIAL HANDLES GRID */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* TikTok Handle */}
          <div className="space-y-1.5">
            <Label htmlFor="tiktok-handle" className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <AtSign className="w-3 h-3 text-zinc-400" />
              TikTok Handle *
            </Label>
            <div className="relative flex items-center rounded-xl bg-black border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3">
              <span className="text-zinc-500 text-xs font-mono select-none">@</span>
              <Input
                id="tiktok-handle"
                type="text"
                value={sanitizeHandle(tiktok)}
                onChange={(e) => onUpdate({ tiktok: sanitizeHandle(e.target.value) })}
                className="bg-transparent border-0 text-white placeholder:text-zinc-600 h-10 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                placeholder="username"
              />
            </div>
          </div>

          {/* Snapchat Handle */}
          <div className="space-y-1.5">
            <Label htmlFor="snapchat-handle" className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-amber-400" />
              Snapchat Handle *
            </Label>
            <div className="relative flex items-center rounded-xl bg-black border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all px-3">
              <span className="text-zinc-500 text-xs font-mono select-none">@</span>
              <Input
                id="snapchat-handle"
                type="text"
                value={sanitizeHandle(snapchat)}
                onChange={(e) => onUpdate({ snapchat: sanitizeHandle(e.target.value) })}
                className="bg-transparent border-0 text-white placeholder:text-zinc-600 h-10 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                placeholder="username"
              />
            </div>
          </div>
        </motion.div>

        {/* STORE BIO TEXTAREA */}
        <motion.div variants={fadeInUp} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="store-bio" className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-zinc-400" />
              Store Manifesto / Bio (Optional)
            </Label>
            <span className="text-[10px] font-mono text-zinc-500">
              {storeBio.length}/{maxBioLength}
            </span>
          </div>

          <div className="relative rounded-xl bg-black border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all overflow-hidden">
            <Textarea
              id="store-bio"
              value={storeBio}
              onChange={(e) => onUpdate({ storeBio: e.target.value })}
              className="bg-transparent border-0 text-white placeholder:text-zinc-600 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 h-24 text-xs resize-none p-3"
              placeholder="Detail your digital product ecosystem, creator mission, or store updates..."
              maxLength={maxBioLength}
            />
            {/* Dynamic Character Gauge Bar */}
            <div className="h-0.5 w-full bg-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${bioProgress}%` }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}