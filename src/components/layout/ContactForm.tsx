"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";
import { clsx } from "@/lib/utils";

const SUBJECTS = [
  "Ürün / parça uyumluluğu",
  "Stok ve fiyat bilgisi",
  "Sipariş ve kargo",
  "İade / garanti",
  "Bayilik başvurusu",
  "Diğer",
] as const;

interface Errors {
  name?: string;
  phone?: string;
  message?: string;
}

/**
 * Contact form.
 *
 * There is no backend yet, so submission composes a prefilled WhatsApp message
 * instead of silently dropping the enquiry — a form that pretends to send is
 * worse than no form. Validation is real so the markup and error handling can
 * be reused unchanged once a POST endpoint exists.
 */
export function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    subject: SUBJECTS[0] as string,
    vehicle: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Lütfen adınızı yazın.";

    const digits = values.phone.replace(/\D/g, "");
    if (digits.length < 10) next.phone = "Geçerli bir telefon numarası girin.";

    if (values.message.trim().length < 10) next.message = "Mesajınızı biraz daha açıklayın (en az 10 karakter).";

    return next;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = [
      `Ad Soyad: ${values.name}`,
      `Telefon: ${values.phone}`,
      values.email ? `E-posta: ${values.email}` : null,
      `Konu: ${values.subject}`,
      values.vehicle ? `Araç / Parça: ${values.vehicle}` : null,
      "",
      values.message,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(site.whatsapp, body), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const fieldClass =
    "h-11 w-full rounded-md border bg-white px-3 text-[0.95rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400";

  function borderFor(error?: string) {
    return error ? "border-signal-500 focus:border-signal-500" : "border-ink-300 focus:border-ink-950";
  }

  if (sent) {
    return (
      <div className="rounded-card bg-white p-8 text-center ring-1 ring-ink-200">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-whatsapp/10 text-whatsapp-dark">
          <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-ink-950">
          WhatsApp penceresi açıldı
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
          Mesajınız hazırlandı. Pencere açılmadıysa aşağıdaki butonu kullanarak doğrudan yazabilirsiniz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink(site.whatsapp, values.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-whatsapp px-5 text-sm font-semibold text-white"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp&apos;ı Aç
          </a>
          <Button type="button" variant="outline" onClick={() => setSent(false)}>
            Yeni mesaj yaz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-card bg-white p-5 ring-1 ring-ink-200 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink-800">
            Ad Soyad <span className="text-signal-500">*</span>
          </label>
          <input
            id="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={clsx(fieldClass, borderFor(errors.name))}
            placeholder="Adınız ve soyadınız"
          />
          {errors.name ? (
            <p id="name-error" className="mt-1 text-xs font-medium text-signal-500">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink-800">
            Telefon <span className="text-signal-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={clsx(fieldClass, borderFor(errors.phone))}
            placeholder="05XX XXX XX XX"
          />
          {errors.phone ? (
            <p id="phone-error" className="mt-1 text-xs font-medium text-signal-500">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink-800">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            className={clsx(fieldClass, borderFor())}
            placeholder="ornek@firma.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-ink-800">
            Konu
          </label>
          <select
            id="subject"
            value={values.subject}
            onChange={(event) => update("subject", event.target.value)}
            className={clsx(fieldClass, borderFor())}
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="vehicle" className="mb-1.5 block text-sm font-semibold text-ink-800">
            Araç bilgisi veya parça kodu
          </label>
          <input
            id="vehicle"
            value={values.vehicle}
            onChange={(event) => update("vehicle", event.target.value)}
            className={clsx(fieldClass, borderFor())}
            placeholder="Örn. Renault Megane IV 1.5 dCi 2018 — SD5S14-6634"
          />
          <p className="mt-1 text-xs text-ink-500">
            Doğru parçayı ilk seferde bulabilmemiz için en faydalı bilgi budur.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink-800">
            Mesajınız <span className="text-signal-500">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={clsx(
              "w-full rounded-md border bg-white px-3 py-2.5 text-[0.95rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400",
              borderFor(errors.message),
            )}
            placeholder="Talebinizi kısaca açıklayın…"
          />
          {errors.message ? (
            <p id="message-error" className="mt-1 text-xs font-medium text-signal-500">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp ile Gönder
        </Button>
        <p className="text-xs leading-relaxed text-ink-500">
          Form şu an mesajınızı WhatsApp&apos;a aktarır. E-posta ile gönderim, backend kurulumuyla birlikte
          devreye alınacaktır.
        </p>
      </div>
    </form>
  );
}
