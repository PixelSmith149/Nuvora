"use client";

import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AssetAudit } from "@/lib/market/useAuditStream";
import supabase from "@/lib/supabase/client";
import type { CreateListingInput } from "@/lib/use-market";
import { useMarket } from "@/lib/use-market";

interface PhaseVerifiedProps {
  audit: AssetAudit;
  userId: string;
  auditId: string;
  onSuccess: () => void;
  showToast: (props: any) => void;
}

export function PhaseVerified({
  audit,
  userId,
  auditId,
  onSuccess,
  showToast,
}: PhaseVerifiedProps) {
  const { createListing } = useMarket(userId);
  const [price, setPrice] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        showToast({
          variant: "destructive",
          title: "File Too Large",
          description: "Maximum file size is 5MB",
        });
        return;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        showToast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Only JPEG, PNG, WebP, and GIF are allowed",
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) throw new Error("You must be logged in to upload");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("auditId", auditId);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/market-place/upload-asset-image");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        });

        const response = await new Promise<{ url: string }>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(formData);
        });

        setMediaUrl(response.url);
        showToast({
          title: "Upload Complete",
          description: "Cover image uploaded successfully",
        });
      } catch (err: any) {
        showToast({
          variant: "destructive",
          title: "Upload Failed",
          description: err.message,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [auditId, showToast]
  );

  const publish = async () => {
    if (!price || !mediaUrl || !audit) return;

    setIsSubmitting(true);

    const meta = audit.raw_meta_payload;

    const listingInput: CreateListingInput = {
      title: `${audit.platform_name.replace(/_/g, " ").toUpperCase()} Account - @${audit.target_username}`,
      description:
        meta?.account_bio ||
        `Verified ${audit.platform_name} account @${audit.target_username}`,
      display_pic_url: mediaUrl,
      price: parseFloat(price),
      tab_category: "socio_market",
      product_sale_type: "not_applicable",
      asset_payload: {
        username: audit.target_username,
        password: audit.account_password,
        platform_name: audit.platform_name,
        audit_reference: auditId,
      },
    };

    const success = await createListing(listingInput);
    setIsSubmitting(false);

    if (success) {
      onSuccess();
    }
  };

  const followers =
    audit.follower_count ??
    audit.raw_meta_payload?.followers_count ??
    0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <p className="text-xs text-emerald-400 font-bold">
          ✅ Account Verified Successfully
        </p>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs font-mono border border-white/[0.02]">
        <div>
          <span className="text-zinc-500 block text-[10px]">ACCOUNT</span>
          <span className="text-zinc-200 font-bold">@{audit.target_username}</span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[10px]">FOLLOWERS</span>
          <span className="text-emerald-400 font-bold text-base">
            {followers.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[10px]">PLATFORM</span>
          <span className="text-zinc-300 capitalize">
            {audit.platform_name.replace(/_/g, " ")}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[10px]">STATUS</span>
          <span className="text-zinc-400 text-[10px]">✅ Verified</span>
        </div>
      </div>

      <div className="space-y-3.5 pt-2 border-t border-white/5">
        <div className="space-y-1">
          <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
            Asking Price (USD)
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
            Cover Image
          </Label>

          {!mediaUrl && !isUploading && (
            <label className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/30 bg-zinc-900/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Camera className="h-4 w-4 text-zinc-500" />
              <span className="text-[11px] text-zinc-400 font-medium">
                Upload Cover Image
              </span>
              <span className="text-[10px] text-zinc-600">Max 5MB • JPEG, PNG, WebP, GIF</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
          )}

          {isUploading && (
            <div className="border-2 border-zinc-800 bg-zinc-900/40 rounded-xl p-4 flex flex-col items-center gap-2">
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
              <span className="text-[11px] text-zinc-400">Uploading... {uploadProgress}%</span>
              <div className="w-full max-w-xs h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {mediaUrl && !isUploading && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 max-w-xs">
              <img src={mediaUrl} alt="Cover" className="w-full h-24 object-cover" />
              <button
                onClick={() => setMediaUrl("")}
                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white"
              >
                Replace Image
              </button>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={publish}
        disabled={!price || !mediaUrl || isSubmitting}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs h-10 rounded-xl disabled:opacity-30"
      >
        {isSubmitting ? "Publishing..." : "🚀 Publish Verified Account"}
      </Button>
    </div>
  );
}