"use client";

import {
  AlertCircle,
  Code,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================
// TYPES
// ============================================================

interface OneTimeTool {
  id: string;
  listing_id: string;
  seller_id: string;
  product_title: string;
  product_description: string | null;
  sale_price: number;
  display_cover_url: string | null;
  storage_vault_path: string;
  file_original_name: string;
  file_size_bytes: number;
  file_mime_type: string;
  asset_category: string | null;
  asset_type: string | null;
  asset_content: any | null;
}

interface ReusableProduct {
  id: string;
  listing_id: string;
  seller_id: string;
  asset_category: string;
  product_title: string;
  product_description: string | null;
  usage_guidelines_diy: string | null;
  risk_cautions: string | null;
  sale_price: number;
  display_cover_url: string | null;
  fulfillment_payload: Record<string, unknown>;
}

interface SocioMetrics {
  id: string;
  listing_id: string;
  seller_id: string;
  platform_name: string;
  target_username: string;
  followers_count: number;
  account_bio: string | null;
}

interface AssetContentRendererProps {
  assetType: "one_time" | "reusable" | "socio";
  assetData: any;
  listing: any;
  onDownload?: (url: string, fileName: string) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function AssetContentRenderer({
  assetType,
  assetData,
  listing,
  onDownload,
}: AssetContentRendererProps) {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!assetData) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No asset data available</p>
      </div>
    );
  }

  // ─── ONE-TIME PRODUCT ──────────────────────────────────────
  if (assetType === "one_time") {
    const tool = assetData as OneTimeTool;

    return (
      <div className="space-y-4">
        {/* File Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5">
          <FileText className="h-5 w-5 text-emerald-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {tool.file_original_name || "Product file"}
            </p>
            <p className="text-xs text-zinc-500">
              {tool.file_size_bytes
                ? `${(tool.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
                : "Unknown size"}{" "}
              · {tool.file_mime_type || "Unknown format"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              onDownload?.(
                tool.storage_vault_path,
                tool.file_original_name || "download",
              )
            }
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8 px-3 rounded-xl"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
        </div>

        {/* Asset Content (if not file) */}
        {tool.asset_type !== "file" && tool.asset_content && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
            <p className="text-xs text-zinc-500 font-medium mb-2">
              Asset Content
            </p>
            {tool.asset_type === "link" ? (
              <a
                href={tool.asset_content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {tool.asset_content}
              </a>
            ) : tool.asset_type === "code" ? (
              <pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                <code>{tool.asset_content}</code>
              </pre>
            ) : (
              <p className="text-sm text-zinc-300">{tool.asset_content}</p>
            )}
          </div>
        )}

        {/* Category */}
        {tool.asset_category && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Category:</span>
            <Badge className="bg-zinc-800 text-zinc-300 border-white/5">
              {tool.asset_category.replace(/_/g, " ")}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // ─── REUSABLE PRODUCT ──────────────────────────────────────
  if (assetType === "reusable") {
    const product = assetData as ReusableProduct;

    return (
      <div className="space-y-4">
        {/* DIY Manual */}
        {product.usage_guidelines_diy && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 inline mr-1.5" />
              Setup Instructions
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {product.usage_guidelines_diy}
            </p>
          </div>
        )}

        {/* Risk Cautions */}
        {product.risk_cautions && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1.5" />
              Risk & Cautions
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {product.risk_cautions}
            </p>
          </div>
        )}

        {/* Fulfillment Payload */}
        {product.fulfillment_payload && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Code className="h-3.5 w-3.5 inline mr-1.5" />
              Fulfillment Details
            </p>
            <pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto">
              <code>
                {JSON.stringify(product.fulfillment_payload, null, 2)}
              </code>
            </pre>
          </div>
        )}

        {/* Category */}
        {product.asset_category && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Category:</span>
            <Badge className="bg-zinc-800 text-zinc-300 border-white/5">
              {product.asset_category.replace(/_/g, " ")}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // ─── SOCIAL ACCOUNT ────────────────────────────────────────
  if (assetType === "socio") {
    const socio = assetData as SocioMetrics;
    // Get credentials from the listing's encrypted_asset_payload
    let credentials = null;
    try {
      const payload = listing?.encrypted_asset_payload
        ? JSON.parse(listing.encrypted_asset_payload)
        : null;
      if (payload) {
        credentials = {
          username: payload.username || socio.target_username,
          password: payload.password || "********",
        };
      }
    } catch {
      // Silent fail
    }

    return (
      <div className="space-y-4">
        {/* Account Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
              Platform
            </p>
            <p className="text-sm font-bold text-white">
              {socio.platform_name}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
              Followers
            </p>
            <p className="text-sm font-bold text-emerald-400">
              {socio.followers_count.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Credentials */}
        {credentials && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <KeyRound className="h-3.5 w-3.5 inline mr-1.5" />
                Credentials
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCredentials(!showCredentials)}
                className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
              >
                {showCredentials ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Username</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">
                    {showCredentials ? credentials.username : "••••••••"}
                  </span>
                  {showCredentials && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(credentials.username)}
                      className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">
                    {showCredentials ? credentials.password : "••••••••"}
                  </span>
                  {showCredentials && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(credentials.password)}
                      className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {copied && (
              <p className="text-[10px] text-emerald-400 mt-1">✓ Copied!</p>
            )}
          </div>
        )}

        {/* Bio */}
        {socio.account_bio && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
              Bio
            </p>
            <p className="text-sm text-zinc-300">{socio.account_bio}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-zinc-500">
      <p className="text-sm">Unknown asset type</p>
    </div>
  );
}