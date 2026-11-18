import type { Metadata } from "next";
import { Breadcrumb } from "@/components/commerce/Breadcrumb";
import { ContactForm } from "@/components/layout/ContactForm";
import { Container } from "@/components/ui/Container";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { formatPhone, whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${site.legalName} iletişim bilgileri, adres, telefon ve bayilik başvurusu.`,
  alternates: { canonical: "/iletisim" },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${site.url}/iletisim`,
    mainEntity: {
      "@type": "Organization",
      name: site.legalName,
      telephone: site.phone,
      email: site.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.district,
        addressRegion: site.address.city,
        addressCountry: "TR",
      },
    },
  };

  return (
    <Container>
      <Breadcrumb items={[{ label: "İletişim" }]} />

      <header className="pb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[2rem]">İletişim</h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-600">
          Parça uyumluluğu, stok durumu, toptan fiyat veya bayilik başvurusu — hangi konuda olursa olsun bize
          ulaşın. En hızlı yanıtı WhatsApp hattımızdan alırsınız.
        </p>
      </header>

      <div className="grid gap-8 pb-16 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <ContactForm />

        <aside className="space-y-4">
          <a
            href={whatsappLink(site.whatsapp, "Merhaba, bilgi almak istiyorum.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-card bg-whatsapp p-5 text-white transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-9 w-9 shrink-0" />
            <span>
              <span className="block font-display text-sm font-bold tracking-wide uppercase opacity-90">
                WhatsApp Destek
              </span>
              <span className="block font-display text-lg font-extrabold tabular">{formatPhone(site.phone)}</span>
            </span>
          </a>

          <ul className="divide-y divide-ink-200 overflow-hidden rounded-card bg-white ring-1 ring-ink-200">
            {[
              { Icon: PhoneIcon, label: "Telefon", value: formatPhone(site.phone), href: `tel:${site.phone}` },
              { Icon: MailIcon, label: "E-posta", value: site.email, href: `mailto:${site.email}` },
              {
                Icon: MapPinIcon,
                label: "Adres",
                value: `${site.address.street}, ${site.address.district} / ${site.address.city}`,
              },
              { Icon: ClockIcon, label: "Çalışma Saatleri", value: site.workingHours },
            ].map(({ Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-3 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-950" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</span>
                  {href ? (
                    <a href={href} className="block text-sm font-medium text-ink-900 hover:underline">
                      {value}
                    </a>
                  ) : (
                    <span className="block text-sm font-medium text-ink-900">{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-card bg-ink-950 p-5 text-ink-300">
            <h2 className="font-display text-sm font-bold tracking-wide text-brand-400 uppercase">
              Bayilik Başvurusu
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Oto klima servisi, yedek parçacı veya filo bakım ekibiyseniz özel fiyat listemizden yararlanabilirsiniz.
              Formdaki konu alanından &ldquo;Bayilik&rdquo; seçeneğini işaretlemeniz yeterli.
            </p>
          </div>
        </aside>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Container>
  );
}
