"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ArrowDown, ArrowUp, Loader2, Printer, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inr, img, label } from "@/lib/format";
import { isServiceable, quoteCouriers } from "@/lib/shipping";
import { btnLine, input } from "./ui";

export function SubmitButton({ children, className, pendingText }: { children: React.ReactNode; className: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 size={14} className="animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** Runs a bound server action on click, optionally after a confirm(). */
export function ActionButton({
  action,
  children,
  className,
  confirmText,
  title,
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  className: string;
  confirmText?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function StatusSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => Promise<unknown>;
}) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-2">
      <select
        className={`${input} w-auto`}
        value={v}
        disabled={pending}
        onChange={(e) => {
          setV(e.target.value);
          start(async () => {
            await onChange(e.target.value);
          });
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label(o)}
          </option>
        ))}
      </select>
      {pending && <Loader2 size={14} className="animate-spin text-muted" />}
    </div>
  );
}

export function Toggle({ on, action, title }: { on: boolean; action: () => Promise<unknown>; title?: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState(on);
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      onClick={() => {
        setState(!state);
        start(async () => {
          await action();
        });
      }}
      className={`relative h-5 w-9 cursor-pointer rounded-full transition ${state ? "bg-emerald-600" : "bg-stone-300"}`}
    >
      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${state ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={btnLine}>
      <Printer size={14} /> Print label
    </button>
  );
}

export function SlugInputs({ name, slug }: { name?: string; slug?: string }) {
  const [n, setN] = useState(name ?? "");
  const [sl, setSl] = useState(slug ?? "");
  const [touched, setTouched] = useState(Boolean(slug));
  const auto = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (
    <>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Name</span>
        <input
          name="name"
          required
          className={input}
          value={n}
          onChange={(e) => {
            setN(e.target.value);
            if (!touched) setSl(auto(e.target.value));
          }}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">URL slug</span>
        <div className="flex items-center rounded-lg border border-line bg-white pl-3 text-sm text-muted focus-within:border-gold">
          /product/
          <input
            name="slug"
            className="w-full bg-transparent px-1 py-2 text-ink outline-none"
            value={sl}
            onChange={(e) => {
              setTouched(true);
              setSl(auto(e.target.value));
            }}
          />
        </div>
      </label>
    </>
  );
}

export function ImageManager({ initial, canUpload }: { initial: string[]; canUpload: boolean }) {
  const [images, setImages] = useState<string[]>(initial);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const move = (i: number, d: number) => {
    const next = [...images];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    const sb = createClient();
    const added: string[] = [];
    for (const f of Array.from(files)) {
      const path = `${Date.now()}-${f.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
      const { error } = await sb.storage.from("products").upload(path, f, { upsert: false });
      if (error) {
        setErr(error.message);
        continue;
      }
      added.push(sb.storage.from("products").getPublicUrl(path).data.publicUrl);
    }
    setImages((prev) => [...prev, ...added]);
    setBusy(false);
  }

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(src, 300)} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] text-ivory">Cover</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition group-hover:opacity-100">
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/90 p-1"><ArrowUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/90 p-1"><ArrowDown size={12} /></button>
              </span>
              <button type="button" onClick={() => setImages(images.filter((_, k) => k !== i))} className="rounded bg-white/90 p-1 text-rose-700">
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
        {canUpload && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/25 text-xs text-muted hover:border-gold">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {busy ? "Uploading…" : "Upload"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={input} placeholder="…or paste an image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button
          type="button"
          className={btnLine}
          onClick={() => {
            if (url.trim()) setImages([...images, url.trim()]);
            setUrl("");
          }}
        >
          Add
        </button>
      </div>
      {!canUpload && <p className="mt-2 text-xs text-muted">File upload is enabled once Supabase Storage is connected.</p>}
      {err && <p className="mt-2 text-xs text-rose-700">{err}</p>}
    </div>
  );
}

export function PincodeChecker({ couriers, from }: { couriers: string[]; from: string }) {
  const [pin, setPin] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const quotes = checked ? quoteCouriers(checked, couriers, from) : [];
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(pin);
        }}
        className="flex gap-2"
      >
        <input className={input} inputMode="numeric" maxLength={6} placeholder="Delivery pincode e.g. 400050" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        <button className={btnLine}>Check</button>
      </form>
      {checked &&
        (!isServiceable(checked) ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Pincode {checked} is not serviceable.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-lg border border-line">
            {quotes.map((q) => (
              <div key={q.courier} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{q.courier}</span>
                <span className="text-muted">
                  {inr(q.rate)} · {q.etaDays} days
                </span>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export function ConfirmDelete({ action, text = "Delete" }: { action: () => Promise<unknown>; text?: string }) {
  return (
    <ActionButton action={action} confirmText="Delete permanently? This can't be undone." className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 cursor-pointer">
      <Trash2 size={14} /> {text}
    </ActionButton>
  );
}
