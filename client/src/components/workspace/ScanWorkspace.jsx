import { useState, useRef, useEffect } from "react";
import { classifyImage, createReport, uploadReportImage } from "../../services/api";
import { ResultCard } from "./ResultCard";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export function ScanWorkspace() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | file-selected | classifying | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [infoNotice, setInfoNotice] = useState("");
  const [result, setResult] = useState(null);

  // Report saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const dropZoneRef = useRef(null);
  const resultRef = useRef(null);
  const saveInProgressRef = useRef(false);
  const uploadedImageRef = useRef(null);

  // Safely revoke object URLs to prevent memory leaks
  const cleanUpPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewError(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection and client-side validation
  const handleFileSelection = (file, multipleWarning = false) => {
    // If a request was in flight, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    cleanUpPreview();
    setResult(null);
    uploadedImageRef.current = null;
    setSaveStatus("idle");
    setSaveError("");
    setErrorMessage("");
    setErrorCode("");

    if (multipleWarning) {
      setInfoNotice("Multiple items dropped. Using only the first image.");
    } else {
      setInfoNotice("");
    }

    if (!file) return;

    // Check zero-byte file
    if (file.size === 0) {
      setStatus("error");
      setErrorCode("EMPTY_FILE");
      setErrorMessage("The selected file is empty (0 bytes). Please choose a valid photo.");
      setSelectedFile(null);
      return;
    }

    // Check HEIC format explicitly
    const fileName = file.name ? file.name.toLowerCase() : "";
    if (fileName.endsWith(".heic") || fileName.endsWith(".heif") || file.type.includes("heic")) {
      setStatus("error");
      setErrorCode("UNSUPPORTED_HEIC");
      setErrorMessage(
        "HEIC images from iOS devices are not directly supported. Please convert or export to JPEG, PNG, or WebP before uploading."
      );
      setSelectedFile(null);
      return;
    }

    // Check supported MIME type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setStatus("error");
      setErrorCode("INVALID_FILE_TYPE");
      setErrorMessage(
        `Unsupported file type '${file.type || "unknown"}'. Please upload a JPEG, PNG, or WebP image.`
      );
      setSelectedFile(null);
      return;
    }

    // Check file size (5MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setStatus("error");
      setErrorCode("FILE_TOO_LARGE");
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.`
      );
      setSelectedFile(null);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setStatus("file-selected");
    } catch {
      setStatus("error");
      setErrorCode("PREVIEW_FAILED");
      setErrorMessage("Failed to create preview for this image. It may be corrupted.");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const firstFile = files[0];
    const isMultiple = files.length > 1;
    handleFileSelection(firstFile, isMultiple);
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Submit file for classification
  const handleClassify = async () => {
    if (!selectedFile || status === "classifying") return;

    setStatus("classifying");
    setErrorMessage("");
    setErrorCode("");
    setResult(null);
    setSaveStatus("idle");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await classifyImage(selectedFile, {
        signal: controller.signal,
        timeoutMs: 30000
      });

      if (!response.ok) {
        setStatus("error");
        setErrorCode(response.error?.code || "CLASSIFICATION_FAILED");
        setErrorMessage(
          response.error?.message || "Failed to classify the image. Please try again."
        );
        return;
      }

      setResult(response.data);
      setStatus("success");

      // Shift focus or scroll smoothly to result card for screen readers and keyboard users
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    } catch (err) {
      setStatus("error");
      setErrorCode("UNEXPECTED_ERROR");
      setErrorMessage(err.message || "An unexpected error occurred during classification.");
    } finally {
      abortControllerRef.current = null;
    }
  };

  // User Cancel Action
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus(selectedFile ? "file-selected" : "idle");
    setInfoNotice("Classification cancelled by user.");
  };

  // Reset workspace
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cleanUpPreview();
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    setErrorCode("");
    setResult(null);
    setInfoNotice("");
    setSaveStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save report to backend POST /api/reports
  const handleSaveReport = async () => {
    if (saveInProgressRef.current || isSaving || saveStatus === "saved") return;
    if (!result) {
      setSaveStatus("error");
      setSaveError("Classify an image before saving a report.");
      return;
    }
    if (!selectedFile) {
      setSaveStatus("error");
      setSaveError("Select an image before saving a report.");
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);
    setSaveStatus("saving");
    setSaveError("");

    try {
      // Obtain coordinates via HTML5 Geolocation API, with a valid neutral fallback.
      let coords = { latitude: 0, longitude: 0 };
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000
            });
          });
          coords = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6))
          };
        } catch {
          // Geolocation denied or timed out; keep default coordinates [0, 0].
        }
      }

      // Reuse a successful upload if report creation needs to be retried.
      if (!uploadedImageRef.current) {
        const upload = await uploadReportImage(selectedFile);
        if (!upload.ok) {
          throw new Error(upload.error?.message || "Could not upload the selected image.");
        }
        if (
          typeof upload.data?.url !== "string" ||
          !upload.data.url.trim() ||
          typeof upload.data?.publicId !== "string" ||
          !upload.data.publicId.trim()
        ) {
          throw new Error("Image upload returned an invalid response. Please try again.");
        }
        uploadedImageRef.current = {
          url: upload.data.url.trim(),
          publicId: upload.data.publicId.trim()
        };
      }

      // Prepare payload adhering to server/src/models/Report.js schema.
      const payload = {
        category: result.category,
        confidence: typeof result.confidence === "number" ? result.confidence : undefined,
        disposalAdvice: result.disposalAdvice || "Recycle according to local guidelines.",
        recyclable: Boolean(result.recyclable),
        image: uploadedImageRef.current,
        location: coords
      };

      const response = await createReport(payload);
      if (!response.ok) {
        throw new Error(response.error?.message || "Could not save the report.");
      }
      if (typeof response.data?._id !== "string" || !response.data._id.trim()) {
        throw new Error("The server response did not include a saved report ID.");
      }

      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error?.message || "Could not save the report. Please try again.");
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section id="scan-workspace" className="section-wrapper" aria-labelledby="scan-heading">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Live Classifier
          </div>
          <h2 id="scan-heading">Scan & Identify Waste</h2>
          <p>
            Drop or upload a photo of your discarded item. Our computer vision model classifies the material stream,
            assigns the proper bin, and details the circular recovery pipeline.
          </p>
        </div>

        {/* Live Status Announcements for Screen Readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {status === "classifying" && "Classifying image with AI model, please wait."}
          {status === "success" && `Classification complete. Detected category: ${result?.category}`}
          {status === "error" && `Error: ${errorMessage}`}
        </div>

        {/* Informational notice banner */}
        {infoNotice && (
          <div
            role="status"
            style={{
              maxWidth: "680px",
              margin: "0 auto 1.5rem",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#7dd3fc",
              padding: "0.625rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>{infoNotice}</span>
            <button
              type="button"
              onClick={() => setInfoNotice("")}
              style={{ background: "none", border: "none", color: "#7dd3fc", cursor: "pointer", fontSize: "1.125rem" }}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div
          style={{
            maxWidth: "760px",
            marginInline: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem"
          }}
        >
          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload waste image: click to select file or drag and drop here"
            style={{
              border: `2px dashed ${
                isDragging ? "var(--brand-primary)" : "var(--border-medium)"
              }`,
              backgroundColor: isDragging
                ? "rgba(16, 185, 129, 0.08)"
                : "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "clamp(2rem, 5vw, 3.5rem) 1.5rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--transition-standard)",
              position: "relative"
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="waste-file-input"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              style={{ display: "none" }}
              aria-hidden="true"
            />

            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 1rem",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                color: "var(--brand-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              {selectedFile ? "Replace Selected Image" : "Drop waste photo here, or click to browse"}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 auto" }}>
              Supports JPEG, PNG, or WebP up to 5 MB. One file per scan.
            </p>
          </div>

          {/* Image Preview & Controls */}
          {previewUrl && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                    {selectedFile?.name}
                  </strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem", minHeight: "36px" }}
                >
                  Clear & Choose another
                </button>
              </div>

              {/* Preview image box with scanning beam animation */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxHeight: "340px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "#050a07",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {!previewError ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded waste item to classify"
                    onError={() => setPreviewError(true)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "340px",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                ) : (
                  <div style={{ padding: "2rem", color: "var(--status-danger)", textAlign: "center" }}>
                    Failed to preview image. The image file might be damaged.
                  </div>
                )}

                {/* Subtle laser scan line during classification */}
                {status === "classifying" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(16, 185, 129, 0.08)",
                      pointerEvents: "none"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "var(--brand-primary)",
                        boxShadow: "0 0 16px 4px var(--brand-primary)",
                        animation: "scanBeam 1.6s ease-in-out infinite alternate"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.875rem",
                  flexWrap: "wrap"
                }}
              >
                {status === "classifying" ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    aria-label="Cancel AI classification"
                  >
                    Cancel Scan
                  </button>
                ) : null}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClassify}
                  disabled={status === "classifying"}
                  style={{ minWidth: "160px" }}
                >
                  {status === "classifying" ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(0,0,0,0.2)",
                          borderTopColor: "#000",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite"
                        }}
                      />
                      Classifying...
                    </>
                  ) : (
                    "Scan waste"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {status === "error" && (
            <div
              role="alert"
              style={{
                background: "var(--status-danger-bg)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem 1.5rem",
                color: "#fecaca"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <strong style={{ color: "#f87171" }}>Scan Unsuccessful</strong>
                    {errorCode && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          background: "rgba(239, 68, 68, 0.2)",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "3px",
                          color: "#fca5a5"
                        }}
                      >
                        {errorCode}
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#fca5a5", fontSize: "0.875rem", margin: 0, wordBreak: "break-word" }}>
                    {errorMessage}
                  </p>
                  {errorCode === "ROUTE_NOT_FOUND" && (
                    <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "#fecaca" }}>
                      <em>The classification route could not be found. Confirm the backend is running the current WasteQuest server. For a local UI demo, set <code>VITE_USE_MOCK=true</code> in <code>client/.env</code>.</em>
                    </div>
                  )}
                  {selectedFile && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleClassify}
                      style={{
                        marginTop: "1rem",
                        borderColor: "rgba(239, 68, 68, 0.4)",
                        color: "#fff",
                        fontSize: "0.8125rem",
                        padding: "0.375rem 0.875rem",
                        minHeight: "36px"
                      }}
                    >
                      Retry classification
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result Card Presentation */}
          {status === "success" && result && (
            <div ref={resultRef}>
              <ResultCard
                result={result}
                onSaveReport={handleSaveReport}
                isSaving={isSaving}
                saveStatus={saveStatus}
                saveError={saveError}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanBeam {
          0% { top: 0%; opacity: 0.9; }
          100% { top: calc(100% - 3px); opacity: 0.9; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
