"use client";

export function ExportBar() {
  const onDownload = (format: "pdf" | "docx") => {
    // Placeholder export handler; replace with server-rendered export.
    alert(`Export to ${format.toUpperCase()} coming soon.`);
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Export
      </span>
      <button
        onClick={() => onDownload("pdf")}
        className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-800 hover:border-slate-300"
      >
        PDF
      </button>
      <button
        onClick={() => onDownload("docx")}
        className="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-800 hover:border-slate-300"
      >
        DOCX
      </button>
    </div>
  );
}
