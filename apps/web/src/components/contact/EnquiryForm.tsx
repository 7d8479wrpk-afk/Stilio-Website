"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/icons";

type State = "idle" | "sending" | "sent" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const projectTypes = ["Interior design", "Renovation", "Workplace", "Not sure yet"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "w-full border border-[color:var(--color-field-border)] bg-[color:var(--color-surface)] px-4 py-3 text-[0.95rem] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-gold-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold-ink)] aria-[invalid=true]:border-[color:var(--color-danger)]";

const labelClass =
  "mb-1.5 block font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-ink-3)]";

const fieldRefKeys = ["name", "email", "message"] as const;

export function EnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: projectTypes[0] as (typeof projectTypes)[number],
    location: "",
    message: "",
    company: "",
  });
  const sentRef = useRef<HTMLDivElement>(null);
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    if (state === "sent") sentRef.current?.focus();
  }, [state]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = "Please add your name so we know who's writing.";
    if (!form.email.trim()) errs.email = "Please add an email so we can reply.";
    else if (!EMAIL_RE.test(form.email.trim()))
      errs.email = "That doesn't look like a valid email address.";
    if (form.message.trim().length < 10)
      errs.message = "Please add a line or two about the space so we can help.";
    return errs;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(Object.values(errs)[0]!);
      setState("error");
      const firstInvalid = fieldRefKeys.find((k) => errs[k]);
      if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
      return;
    }
    setFieldErrors({});
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          "We couldn't send that. Please check your details, or email us directly at " +
            brand.email +
            ".",
        );
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError(`Network problem — please email us directly at ${brand.email}.`);
      setState("error");
    }
  }

  if (state === "sent") {
    const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(
      `Enquiry — ${form.projectType}`,
    )}&body=${encodeURIComponent(form.message)}`;
    return (
      <div
        ref={sentRef}
        tabIndex={-1}
        role="status"
        className="anim-fade-up border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-8 outline-none shadow-[var(--shadow-panel)]"
      >
        <p className="eyebrow">Received</p>
        <h2 className="mt-4 font-display text-[1.8rem] text-[color:var(--color-ink)]">
          Thank you, {form.name.split(" ")[0] || "there"}.
        </h2>
        <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-[color:var(--color-ink-2)]">
          Your enquiry is with the studio. We reply to every project enquiry
          personally, usually within two working days.
        </p>
        <a
          href={mailto}
          className="link-underline mt-5 inline-flex items-center gap-2 font-sans text-meta uppercase tracking-[0.2em] text-[color:var(--color-gold-ink)]"
        >
          Prefer email? Open a draft <ArrowRight width={14} height={14} />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={form.company}
        onChange={set("company")}
        className="hidden"
      />

      <p className="text-caption text-[color:var(--color-ink-3)]">
        <span aria-hidden>*</span> Required
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Name <span aria-hidden>*</span>
          </span>
          <input
            ref={fieldRefs.name}
            required
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={fieldClass}
          />
          {fieldErrors.name ? (
            <span id="name-error" className="mt-1.5 block text-meta text-[color:var(--color-danger)]">
              {fieldErrors.name}
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className={labelClass}>
            Email <span aria-hidden>*</span>
          </span>
          <input
            ref={fieldRefs.email}
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={fieldClass}
          />
          {fieldErrors.email ? (
            <span id="email-error" className="mt-1.5 block text-meta text-[color:var(--color-danger)]">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Project type</span>
          <select value={form.projectType} onChange={set("projectType")} className={fieldClass}>
            {projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>
            Location <span className="normal-case tracking-normal text-[color:var(--color-ink-3)]">(optional)</span>
          </span>
          <input
            autoComplete="address-level2"
            value={form.location}
            onChange={set("location")}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>
          About the space <span aria-hidden>*</span>
        </span>
        <textarea
          ref={fieldRefs.message}
          required
          rows={5}
          value={form.message}
          onChange={set("message")}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-hint message-error" : "message-hint"}
          placeholder="What are you looking to change, and roughly when?"
          className={cn(fieldClass, "resize-none")}
        />
        <span id="message-hint" className="mt-1.5 block text-meta text-[color:var(--color-ink-3)]">
          A sentence or two is plenty.
        </span>
        {fieldErrors.message ? (
          <span id="message-error" className="mt-1.5 block text-meta text-[color:var(--color-danger)]">
            {fieldErrors.message}
          </span>
        ) : null}
      </label>

      {state === "error" ? (
        <p
          role="alert"
          className="border-l-2 border-[color:var(--color-danger)] bg-[color:var(--color-surface)] py-2 pl-3 text-[0.85rem] font-medium text-[color:var(--color-ink)]"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        aria-busy={state === "sending"}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2.5 bg-[color:var(--color-onyx)] px-8 py-4 font-sans text-meta uppercase tracking-[0.22em] text-[color:var(--color-marble)] transition-colors hover:bg-[color:var(--color-espresso)] disabled:bg-[color:var(--color-line-strong)] disabled:text-[color:var(--color-ink-3)] sm:w-auto sm:justify-start"
      >
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
