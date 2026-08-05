"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import type { GlobalMarketOrder, ListingWithMetrics } from "@/lib/types";
import { ReviewModal } from "./ReviewModal";
import { AssetDetailModal } from "./locker/AssetDetailModal";
import { LockerCard } from "./locker/LockerCard";

// ============================================================
// TYPES
// ============================================================

interface EnrichedOrder extends GlobalMarketOrder {
  asset_type: "one_time" | "reusable" | "socio";
  asset_data: any;
}

interface AssetPurchaseLockerProps {
  orders: GlobalMarketOrder[];
  listings: ListingWithMetrics[];
  currentUserId: string | null;
  onRefresh: () => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AssetPurchaseLocker({
  orders,
  listings,
  currentUserId,
  onRefresh,
}: AssetPurchaseLockerProps) {
  const [enrichedOrders, setEnrichedOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedAssetData, setSelectedAssetData] = useState<any>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<
    "one_time" | "reusable" | "socio" | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ─── Enrich orders with asset data ──────────────────────
  useEffect(() => {
    async function enrichOrders() {
      if (!currentUserId || orders.length === 0) {
        setEnrichedOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const myOrders = orders.filter((o) => o.buyer_id === currentUserId);
        const enriched: EnrichedOrder[] = [];

        for (const order of myOrders) {
          const listing = listings.find((l) => l.id === order.listing_id);
          if (!listing) continue;

          let assetType: "one_time" | "reusable" | "socio" = "one_time";
          let assetData: any = null;

          // Determine asset type and fetch data
          if (listing.tab_category === "socio_market") {
            assetType = "socio";
            // Fetch from socio_market_metrics
            const { data } = await supabase
              .from("socio_market_metrics")
              .select("*")
              .eq("listing_id", listing.id)
              .maybeSingle();
            assetData = data;
          } else if (listing.product_sale_type === "one_time") {
            assetType = "one_time";
            const { data } = await supabase
              .from("one_time_digital_tools")
              .select("*")
              .eq("listing_id", listing.id)
              .maybeSingle();
            assetData = data;
          } else if (
            listing.product_sale_type === "recurring" ||
            listing.tab_category === "digital_tool"
          ) {
            assetType = "reusable";
            const { data } = await supabase
              .from("reusable_digital_products")
              .select("*")
              .eq("listing_id", listing.id)
              .maybeSingle();
            assetData = data;
          }

          enriched.push({
            ...order,
            asset_type: assetType,
            asset_data: assetData,
          });
        }

        setEnrichedOrders(enriched);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    enrichOrders();
  }, [orders, listings, currentUserId]);

  // ─── AUTO-CONFIRM on force refresh / page load ─────────────
useEffect(() => {
  if (!currentUserId || enrichedOrders.length === 0) return;

  async function autoConfirmPendingOrders() {
    const pendingOrders = enrichedOrders.filter(
      (o) =>
        o.status === "pending_verification" ||
        o.status === "delivered" ||
        o.status === "pending",
    );

    if (pendingOrders.length === 0) return;

    for (const order of pendingOrders) {
      try {
        const response = await fetch("/api/delivery/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: order.id }),
        });

        if (response.ok) {
          // Update local state
          setEnrichedOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                    ...o,
                    status: "completed",
                    confirmed_at: new Date().toISOString(),
                  }
                : o,
            ),
          );
        }
      } catch (err) {
        console.error("Auto-confirm failed for order:", order.id, err);
      }
    }

    // Refresh parent data after auto-confirm
    await onRefresh();
  }

  autoConfirmPendingOrders();
}, [enrichedOrders.length, currentUserId]); // only run when orders are first loaded

  // ─── Handle card click ──────────────────────────────────
  const handleCardClick = (order: EnrichedOrder) => {
    const listing = listings.find((l) => l.id === order.listing_id);
    if (!listing) return;

    setSelectedOrder(order);
    setSelectedListing(listing);
    setSelectedAssetData(order.asset_data);
    setSelectedAssetType(order.asset_type);
    setModalOpen(true);
  };

  // ─── Handle delivery confirmation ──────────────────────────
  const handleDeliveryConfirm = async () => {
    if (!selectedOrder) return;

    setConfirming(true);
    try {
      const response = await fetch("/api/delivery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: selectedOrder.id }),
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ Force refresh multiple times to ensure state updates
        await onRefresh();

        // ✅ Also manually update the local order status
        const updatedOrder = {
          ...selectedOrder,
          status: "completed",
          confirmed_at: new Date().toISOString(),
        };
        setSelectedOrder(updatedOrder as any);

        // ✅ Update the enrichedOrders list locally
        setEnrichedOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? { ...o, status: "completed" as any }
              : o,
          ),
        );

        setModalOpen(false);
        setReviewOrderId(selectedOrder.id);
        setReviewModalOpen(true);
      } else {
        alert(result.error || "Failed to confirm delivery");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setConfirming(false);
    }
  };

  // ─── Handle review submission ──────────────────────────
  const handleReviewSubmit = async (
    orderId: string,
    rating: number,
    reviewText: string,
  ) => {
    try {
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rating,
          review_text: reviewText,
        }),
      });

      if (response.ok) {
        setReviewModalOpen(false);
        setReviewOrderId(null);
        await onRefresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  // ─── Handle download ────────────────────────────────────
  const handleDownload = async (path: string, fileName: string) => {
    try {
      const response = await fetch("/api/storage/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, fileName }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to download");
        return;
      }

      if (result.url) {
        // Open in new tab or trigger download
        const a = document.createElement("a");
        a.href = result.url;
        a.download = result.fileName || fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      alert("Failed to download file");
    }
  };

  // ─── Loading state ──────────────────────────────────────
  if (!isClient || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-zinc-500 mt-2">Loading your assets...</p>
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────────────
  if (enrichedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-sm font-semibold text-zinc-400">
          Your locker is empty
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          Purchased assets will appear here once you make a purchase.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Cards */}
      <div className="space-y-3">
        {enrichedOrders.map((order) => {
          const listing = listings.find((l) => l.id === order.listing_id);
          if (!listing) return null;

          return (
            <LockerCard
              key={order.id}
              order={order}
              listing={listing}
              assetType={order.asset_type}
              onClick={() => handleCardClick(order)}
            />
          );
        })}
      </div>

      {/* Asset Detail Modal */}
      {selectedOrder && selectedListing && selectedAssetType && (
        <AssetDetailModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
            setSelectedListing(null);
          }}
          order={selectedOrder}
          listing={selectedListing}
          assetData={selectedAssetData}
          assetType={selectedAssetType}
          onConfirm={handleDeliveryConfirm}
          onReview={(orderId) => {
            setModalOpen(false);
            setReviewOrderId(orderId);
            setReviewModalOpen(true);
          }}
          onDownload={handleDownload}
          isConfirming={confirming}
        />
      )}

      {/* Review Modal */}
      {reviewOrderId && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewOrderId(null);
          }}
          orderId={reviewOrderId}
          assetTitle={selectedListing?.title || "Asset"}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
}