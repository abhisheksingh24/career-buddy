"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker - use absolute URL for better compatibility
if (typeof window !== "undefined") {
  // Use absolute URL for worker to avoid path issues
  const workerUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/pdf.worker.min.mjs`
      : "/pdf.worker.min.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "resume-pdf-viewer.tsx:15",
      message: "PDF.js worker configured",
      data: { workerSrc: pdfjs.GlobalWorkerOptions.workerSrc, workerUrl },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "B",
    }),
  }).catch(() => {});
  // Test if worker file is accessible
  fetch(workerUrl, { method: "HEAD" })
    .then((response) => {
      fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "resume-pdf-viewer.tsx:workerTest",
          message: "Worker file test",
          data: { status: response.status, ok: response.ok, url: workerUrl },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "B",
        }),
      }).catch(() => {});
    })
    .catch((error) => {
      fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "resume-pdf-viewer.tsx:workerTest",
          message: "Worker file test failed",
          data: { error: error.message, url: workerUrl },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "B",
        }),
      }).catch(() => {});
    });
  // #endregion
}

interface ResumePDFViewerProps {
  fileUrl: string | null; // URL to PDF file (API endpoint)
  fileType: string; // 'application/pdf' or 'text/plain'
  isLoading?: boolean;
}

export function ResumePDFViewer({ fileUrl, fileType, isLoading = false }: ResumePDFViewerProps) {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "resume-pdf-viewer.tsx:24",
      message: "ResumePDFViewer render",
      data: { fileUrl, fileType, isLoading },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Fetch PDF as Blob and create Blob URL (better compatibility with react-pdf)
  useEffect(() => {
    if (!fileUrl || fileType !== "application/pdf") {
      setPdfBlobUrl(null);
      return;
    }

    const absoluteFileUrl = fileUrl.startsWith("/")
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${fileUrl}`
      : fileUrl;

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "resume-pdf-viewer.tsx:useEffect",
        message: "Fetching PDF as Blob",
        data: { absoluteFileUrl },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "E",
      }),
    }).catch(() => {});
    // #endregion

    fetch(absoluteFileUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "resume-pdf-viewer.tsx:useEffect",
            message: "Blob URL created",
            data: { blobUrl, blobSize: blob.size },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }).catch(() => {});
        // #endregion
        setPdfBlobUrl(blobUrl);
        setPdfLoading(false);
      })
      .catch((error) => {
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "resume-pdf-viewer.tsx:useEffect",
            message: "Blob fetch failed",
            data: { error: error.message },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }).catch(() => {});
        // #endregion
        setPdfError("Failed to fetch PDF file.");
        setPdfLoading(false);
      });

    // Cleanup: revoke blob URL on unmount or when fileUrl changes
    return () => {
      setPdfBlobUrl((prevBlobUrl) => {
        if (prevBlobUrl) {
          URL.revokeObjectURL(prevBlobUrl);
        }
        return null;
      });
    };
  }, [fileUrl, fileType]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "resume-pdf-viewer.tsx:31",
        message: "PDF document loaded successfully",
        data: { numPages },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion
    setNumPages(numPages);
    setPdfLoading(false);
    setPdfError(null);
    setPageNumber(1); // Reset to first page when new document loads
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "resume-pdf-viewer.tsx:38",
        message: "PDF document load error",
        data: { error: error.message, stack: error.stack },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion
    console.error("PDF load error:", error);
    setPdfError("Failed to load PDF. Please try uploading again.");
    setPdfLoading(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1.0);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  }, [numPages]);

  // Use Blob URL if available, otherwise compute absolute URL
  const documentFileUrl = useMemo(() => {
    if (pdfBlobUrl) {
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "resume-pdf-viewer.tsx:useMemo",
          message: "Using Blob URL",
          data: { pdfBlobUrl },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run2",
          hypothesisId: "E",
        }),
      }).catch(() => {});
      // #endregion
      return pdfBlobUrl;
    }
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    const fullUrl = fileUrl.startsWith("/")
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${fileUrl}`
      : fileUrl;
    // #region agent log
    if (typeof window !== "undefined") {
      fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "resume-pdf-viewer.tsx:useMemo",
          message: "Computed absolute URL",
          data: { fileUrl, fullUrl, origin: window.location.origin },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run2",
          hypothesisId: "C",
        }),
      }).catch(() => {});
    }
    // #endregion
    return fullUrl;
  }, [fileUrl, pdfBlobUrl]);

  // Empty state - no PDF available
  if (!fileUrl || fileType !== "application/pdf") {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-12 h-full min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No PDF Available</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {fileType === "text/plain"
              ? "Please upload a PDF resume to view it here. Text-only resumes cannot be displayed."
              : "Please upload a PDF resume to view it in the interactive analysis."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading || pdfLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (pdfError) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-12 h-full min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading PDF</h3>
          <p className="text-sm text-red-600 text-center max-w-sm mb-4">{pdfError}</p>
          <Button
            variant="outline"
            onClick={() => {
              setPdfError(null);
              setPdfLoading(true);
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 border-b rounded-t-lg">
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomReset}
            className="h-8 px-2 text-xs"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Page Navigation */}
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="h-8 w-8 p-0"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700 min-w-[5rem] text-center">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={pageNumber >= numPages}
              className="h-8 w-8 p-0"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* PDF Display Area */}
      <Card className="flex-1 overflow-auto">
        <CardContent className="p-4 flex justify-center items-start min-h-full">
          <div className="bg-white shadow-sm">
            <Document
              key={documentFileUrl} // Force remount when URL changes
              file={documentFileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onLoadProgress={({ loaded, total }) => {
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/9461d7c9-c815-4bb2-bdd1-550b35efca7c", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "resume-pdf-viewer.tsx:onLoadProgress",
                    message: "PDF load progress",
                    data: { loaded, total, fileUrl: documentFileUrl },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run2",
                    hypothesisId: "C",
                  }),
                }).catch(() => {});
                // #endregion
              }}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Skeleton className="h-[800px] w-[600px]" />
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-8">
                  <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                  <p className="text-sm text-red-600">Failed to load PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="border border-gray-200"
              />
            </Document>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
