"use client";

import { useState, useTransition, useRef } from "react";
import { Mail, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  scanGmailAction,
  uploadReceiptAction,
  reauthorizeGmailAction,
} from "@/app/actions/detection";
import { DedupReviewPanel } from "./dedup-review-panel";
import type { DedupeCandidate, ScanResult } from "@/lib/detection/types";

const EMPTY: ScanResult = { ok: false, candidates: [] };

export function DetectionActionsPanel({
  lastScannedLabel,
}: {
  lastScannedLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"gmail" | "upload" | null>(null);
  const [candidates, setCandidates] = useState<DedupeCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scopeMissing, setScopeMissing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function apply(result: ScanResult) {
    if (!result.ok) {
      setScopeMissing(Boolean(result.scopeMissing));
      setError(result.error ?? null);
      if (result.scopeMissing && !result.error) {
        setError("Grant Gmail access to scan your inbox.");
      }
      return;
    }
    setScopeMissing(false);
    setError(null);
    setCandidates(result.candidates);
  }

  function runGmailScan() {
    setError(null);
    setBusy("gmail");
    startTransition(async () => {
      const res = await scanGmailAction();
      setBusy(null);
      apply(res);
    });
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy("upload");
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadReceiptAction(EMPTY, fd);
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
      apply(res);
    });
  }

  // After a successful confirm, clear the review so the user can scan again.
  if (candidates) {
    return (
      <DedupReviewPanel
        candidates={candidates}
        onDone={() => setCandidates(null)}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" /> Scan your inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Look through the last 90 days of email for subscription receipts and
            billing confirmations.
          </p>
          {scopeMissing ? (
            <form action={reauthorizeGmailAction}>
              <Button type="submit" className="w-full">
                Grant Gmail access
              </Button>
            </form>
          ) : (
            <Button
              onClick={runGmailScan}
              disabled={pending}
              className="w-full"
            >
              {busy === "gmail" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
                </>
              ) : (
                "Scan Gmail"
              )}
            </Button>
          )}
          {lastScannedLabel && (
            <p className="text-xs text-muted-foreground">
              Last scanned {lastScannedLabel}.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" /> Upload a receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Have a receipt as an image or PDF? Upload it and we&apos;ll read the
            details for you.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={onFileChosen}
            disabled={pending}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInput.current?.click()}
            disabled={pending}
            className="w-full"
          >
            {busy === "upload" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Reading…
              </>
            ) : (
              "Choose file"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
