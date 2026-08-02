"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrder } from "@/lib/orders/createOrder";
import { previewOrderCost } from "@/lib/services/getMarketplaceServices";
import type { MarketplaceService } from "./service-catalog";

interface OrderSheetProps {
  open: boolean;
  service: MarketplaceService | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CostPreview {
  quantity: number;
  retailCost: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export function OrderSheet({
  open,
  service,
  onClose,
  onSuccess,
}: OrderSheetProps) {
  const router = useRouter();

  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [preview, setPreview] = useState<CostPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightLink, setHighlightLink] = useState(false);
  const [highlightQuantity, setHighlightQuantity] = useState(false);

  const quantityNumber = useMemo(() => Number(quantity || 0), [quantity]);

  useEffect(() => {
    if (!service) return;

    if (
      quantityNumber < service.minQuantity ||
      quantityNumber > service.maxQuantity
    ) {
      setPreview(null);
      return;
    }

    let active = true;

    async function loadPreview() {
      try {
        setLoadingPreview(true);
        if (!service) return;

        const result = await previewOrderCost(service.id, quantityNumber);
        if (!active) return;

        setPreview({
          quantity: result.quantity,
          retailCost: result.amount,
        });
      } catch {
        if (!active) return;
        setPreview(null);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    loadPreview();
    return () => {
      active = false;
    };
  }, [quantityNumber, service]);

  useEffect(() => {
    if (!open) {
      setLink("");
      setQuantity("");
      setPreview(null);
      setError(null);
      setHighlightLink(false);
      setHighlightQuantity(false);
    }
  }, [open]);

  if (!open || !service) return null;

  async function handleSubmit() {
    try {
      if (!service) return;

      setError(null);
      setHighlightLink(false);
      setHighlightQuantity(false);

      let hasValidationErrors = false;
      let validationMessage = "";

      const trimmedLink = link.trim();
      const isValidLinkOrHandle =
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?.*$/i.test(
          trimmedLink,
        ) ||
        /^@[\w.-]+$/.test(trimmedLink) ||
        trimmedLink.length >= 4;

      if (!trimmedLink) {
        setHighlightLink(true);
        hasValidationErrors = true;
        validationMessage =
          "Please fill out all necessary fields with valid details before continuing.";
      } else if (!isValidLinkOrHandle) {
        setHighlightLink(true);
        hasValidationErrors = true;
        validationMessage =
          "The target link provided appears invalid. Please input a valid URL or platform handle.";
      }

      if (
        !quantity ||
        quantityNumber < service.minQuantity ||
        quantityNumber > service.maxQuantity
      ) {
        setHighlightQuantity(true);
        hasValidationErrors = true;
        if (!validationMessage) {
          validationMessage =
            "Please fill out all necessary fields with valid details before continuing.";
        }
      }

      if (hasValidationErrors) {
        setError(validationMessage);
        return;
      }

      setSubmitting(true);

      const res = await createOrder({
        serviceId: service.id,
        quantity: quantityNumber,
        target: trimmedLink,
      });

      if (res && "error" in res && (res as any).error) {
        setError(String((res as any).error));
        setSubmitting(false);
        return;
      }

      const createdOrderId = res?.orderId;
      toast.success("Order placed successfully!");
      onSuccess?.();
      onClose();

      if (createdOrderId) {
        router.push(`/s/orders/${createdOrderId}`);
      } else {
        router.push("/s/orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-zinc-800 bg-black shadow-2xl">
        <div className="flex items-start gap-4 border-b border-zinc-800 p-6">
          <button
            onClick={onClose}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900/50 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-semibold text-white">Create Order</h2>
            <p className="mt-1 text-sm text-zinc-400 leading-snug">{service.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Target Link
              </label>
              <input
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  if (e.target.value.trim()) setHighlightLink(false);
                }}
                placeholder="https://... or @handle"
                className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-white outline-none transition-all ${
                  highlightLink
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-zinc-800 focus:border-zinc-600"
                }`}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (e.target.value) setHighlightQuantity(false);
                }}
                min={service.minQuantity}
                max={service.maxQuantity}
                className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-white outline-none transition-all ${
                  highlightQuantity
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-zinc-800 focus:border-zinc-600"
                }`}
              />
              <p className="mt-2 text-xs text-zinc-500">
                Min: {service.minQuantity.toLocaleString()} • Max:{" "}
                {service.maxQuantity.toLocaleString()}
              </p>
            </div>

            <div className="sm:col-span-1">
              <div className="flex h-full flex-col justify-center rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <h3 className="mb-4 text-sm font-medium text-white">Cost Preview</h3>
                {loadingPreview ? (
                  <p className="text-sm text-zinc-400 animate-pulse">Calculating...</p>
                ) : preview ? (
                  <div className="space-y-3">
                    <Row label="Quantity" value={String(preview.quantity)} />
                    <Row
                      label="Total Cost"
                      value={`$${preview.retailCost.toFixed(2)}`}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Enter a valid quantity to see cost.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="sm:col-span-2">
                <div
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                    error.includes("fill out all necessary")
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
                      : "border-red-900 bg-red-950/50 text-red-300"
                  }`}
                >
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-6 bg-black">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "Processing Order..." : "Create Order"}
          </button>
        </div>
      </div>
    </>
  );
}