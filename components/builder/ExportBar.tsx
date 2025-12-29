"use client";

export function ExportBar() {
  const onDownload = (format: "pdf" | "docx") => {
    // Placeholder export handler; replace with server-rendered export.
    alert(`Export to ${format.toUpperCase()} coming soon.`);
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 border border-slate-200 bg-white px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onDownload("pdf")}
          className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:border-slate-300"
        >
          <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          </svg>
          PDF
        </button>
        <button
          onClick={() => onDownload("docx")}
          className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:border-slate-300"
        >
          <svg className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          </svg>
          DOCX
        </button>
      </div>
    </div>
  );
}
