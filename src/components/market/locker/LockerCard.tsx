"use client";

import {
  Calendar,
  DollarSign,
  Eye,
  Layers,
  Package,
  Users,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { GlobalMarketOrder } from "@/lib/types";

interface EnrichedOrder extends GlobalMarketOrder {
  asset_type: "one_time" | "reusable" | "socio";
  asset_data: any;
}

interface LockerCardProps {
  order: EnrichedOrder;
  listing: any;
  assetType: "one_time" | "reusable" | "socio";
  onClick: () => void;
}

export function LockerCard({ order, listing, assetType, onClick }: LockerCardProps) {
  // ✅ Check if listing exists (may be null if deleted)
  const isListingDeleted = !listing || listing === null;

  const isCompleted = order.status === "completed";
  const isPending =
    order.status === "pending_verification" ||
    order.status === "delivered" ||
    order.status === "pending";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          ✓ Completed
        </Badge>
      );
    }
    if (isPending) {
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          ⏳ Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
        {order.status}
      </Badge>
    );
  };

  const getAssetIcon = () => {
    if (assetType === "socio")
      return <Users className="h-4 w-4 text-purple-400" />;
    if (assetType === "one_time")
      return <Package className="h-4 w-4 text-emerald-400" />;
    return <Layers className="h-4 w-4 text-sky-400" />;
  };

  // ✅ Display title with fallback
  const displayTitle = listing?.title || "Asset (No Longer Available)";
  const displayImage = listing?.display_pic_url || null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group bg-zinc-950/60 border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              {getAssetIcon()}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">
              {displayTitle}
            </p>
            {isListingDeleted && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
                Asset Removed
              </Badge>
            )}
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />${order.amount_paid.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(order.purchased_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action hint */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Eye className="h-4 w-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}