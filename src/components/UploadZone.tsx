"use client";

import { useCallback, useState, useRef } from "react";
import { FileArrowUp, File, X, SpinnerGap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language";

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function UploadZone() {
  const { t, lang } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (f: File): string | null => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (!ext || !ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
          return t.upload.errorType;
        }
      }
      if (f.size > MAX_SIZE_BYTES) {
        return t.upload.errorSize;
      }
      return null;
    },
    [t]
  );

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      const err = validate(f);
      if (err) {
        setError(err);
        return;
      }
      setFile(f);
    },
    [validate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    // TODO: wire up to /api/upload → /api/analyze → navigate to /analyze
    await new Promise((r) => setTimeout(r, 1500));
    setIsUploading(false);
  }, [file]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300",
          "bg-warm/[0.03] hover:bg-warm/[0.06]",
          isDragging && "upload-zone-active bg-warm/[0.08] scale-[1.01]",
          file && "border-solid border-warm/30 bg-warm/[0.04] cursor-default",
          !file && !isDragging && "border-foreground/15 hover:border-warm/40",
          error && "border-destructive/40 bg-destructive/[0.03]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "rounded-xl p-4 transition-colors duration-300",
                isDragging
                  ? "bg-warm/20 text-warm"
                  : "bg-foreground/[0.04] text-muted-foreground"
              )}
            >
              <FileArrowUp size={36} weight={isDragging ? "fill" : "duotone"} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {isDragging ? t.upload.dragActive : t.upload.drag}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {lang === "en" ? (
                  <>
                    or{" "}
                    <span className="font-medium text-warm underline underline-offset-4 decoration-warm/40">
                      {t.upload.browse}
                    </span>{" "}
                    — {t.upload.hint}
                  </>
                ) : (
                  <>
                    <span className="font-medium text-warm underline underline-offset-4 decoration-warm/40">
                      {t.upload.browse}
                    </span>{" "}
                    — {t.upload.hint}
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <div className="shrink-0 rounded-lg bg-warm/10 p-3 text-warm">
              <File size={28} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium px-1">{error}</p>
      )}

      {file && (
        <Button
          onClick={handleAnalyze}
          disabled={isUploading}
          className="w-full h-12 rounded-xl bg-warm text-warm-foreground text-sm font-semibold hover:bg-warm/90 transition-all duration-200 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <SpinnerGap size={18} className="animate-spin mr-2" />
              {t.upload.analyzing}
            </>
          ) : (
            t.upload.analyze
          )}
        </Button>
      )}
    </div>
  );
}
