"use client";

import {
  CheckCircle2,
  Layers,
  Loader2,
  Lock,
  Package,
  Star,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GlobalMarketOrder } from "@/lib/types";
import { AssetContentRenderer } from "./AssetContentRenderer";

interface EnrichedOrder extends GlobalMarketOrder {
  asset_type: "one_time" | "reusable" | "socio";
  asset_data: any;
}

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: EnrichedOrder;
  listing: any;
  assetData: any;
  assetType: "one_time" | "reusable" | "socio";
  onConfirm: () => Promise<void>;
  onReview: (orderId: string) => void;
  onDownload: (url: string, fileName: string) => void;
  isConfirming: boolean;
}

export function AssetDetailModal({
  isOpen,
  onClose,
  order,
  listing,
  assetData,
  assetType,
  onConfirm,
  onReview,
  onDownload,
  isConfirming,
}: AssetDetailModalProps) {
  const [isConfirmingLocal, setIsConfirmingLocal] = useState(false);

  if (!isOpen) return null;

  const isListingDeleted = !listing || listing === null;

  const isCompleted = order.status === "completed";
  const isPending =
    order.status === "pending_verification" ||
    order.status === "delivered" ||
    order.status === "pending";

  const handleConfirm = async () => {
    setIsConfirmingLocal(true);
    await onConfirm();
    setIsConfirmingLocal(false);
  };

  // ─── FORCE CONFIRMATION ─────────────────────────────────────
  // User is not allowed to close while receipt is still pending
  const handleCloseAttempt = () => {
    if (isPending) {
      // Do nothing – force them to confirm first
      return;
    }
    onClose();
  };

  const getAssetIcon = () => {
    if (assetType === "socio")
      return <Users className="h-5 w-5 text-purple-400" />;
    if (assetType === "one_time")
      return <Package className="h-5 w-5 text-emerald-400" />;
    return <Layers className="h-5 w-5 text-sky-400" />;
  };

  const getAssetTypeLabel = () => {
    if (assetType === "socio") return "Social Account";
    if (assetType === "one_time") return "One-Time Product";
    return "Reusable Tool";
  };

  const displayTitle = listing?.title || "Asset (No Longer Available)";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop – blocked while pending */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleCloseAttempt}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
              {getAssetIcon()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {displayTitle}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">
                  {getAssetTypeLabel()}
                </span>
                {isListingDeleted && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
                    Asset Removed
                  </Badge>
                )}
                {isCompleted ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                    ✓ Confirmed
                  </Badge>
                ) : isPending ? (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
                    ⏳ Pending Confirmation
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          {/* Close button – disabled while pending */}
          <button
            onClick={handleCloseAttempt}
            disabled={isPending}
            className={`p-1.5 rounded-lg border border-white/5 transition-colors flex-shrink-0 ${
              isPending
                ? "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
            title={isPending ? "Confirm receipt first" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {listing?.display_pic_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
              <img
                src={listing.display_pic_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {assetType === "reusable" && assetData?.product_description && (
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {assetData.product_description}
              </p>
            </div>
          )}

          {assetType === "one_time" && assetData?.product_description && (
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {assetData.product_description}
              </p>
            </div>
          )}

          {assetType === "socio" && assetData?.account_bio && (
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Account Bio
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {assetData.account_bio}
              </p>
            </div>
          )}

          {/* Asset Content */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              <Lock className="h-3.5 w-3.5 inline mr-1.5" />
              Asset Content
            </p>
            <AssetContentRenderer
              assetType={assetType}
              assetData={assetData}
              listing={listing}
              onDownload={onDownload}
            />
          </div>

          {/* Confirm / Actions */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            {isPending && (
              <>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs">
                  You must confirm receipt before leaving this page. This releases the payment to the seller.
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={isConfirmingLocal || isConfirming}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11"
                >
                  {isConfirmingLocal || isConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Confirm Receipt
                </Button>
              </>
            )}

            {isCompleted && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Confirmed</p>
                  <p className="text-xs text-zinc-400">
                    You confirmed receipt on{" "}
                    {new Date(
                      order.confirmed_at || order.purchased_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {isCompleted && (
              <Button
                onClick={() => onReview(order.id)}
                variant="outline"
                className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10 rounded-xl h-10"
              >
                <Star className="h-4 w-4 mr-2" />
                Leave a Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}