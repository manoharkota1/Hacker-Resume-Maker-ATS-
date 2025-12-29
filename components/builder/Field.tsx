import { PropsWithChildren } from "react";
import clsx from "classnames";

type FieldProps = PropsWithChildren<{
  label: string;
  hint?: string;
  className?: string;
}>;

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-slate-600 tracking-wide">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-400 leading-relaxed">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-10 sm:h-11 w-full border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-400",
        props.className
      )}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-400 resize-none",
        props.className
      )}
    />
  );
}
