import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import {
  CardIcon,
  ClockIcon,
  FacebookIcon,
  HeadsetIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  TruckIcon,
  YoutubeIcon,
} from "@/components/ui/icons";
import { formatPhone } from "@/lib/format";
import { footerLinks, site } from "@/lib/site";

const HIGHLIGHT_ICONS = [TruckIcon, ShieldIcon, HeadsetIcon, CardIcon] as const;

export function Footer() {
  const year = 2026;

  return (
    <footer className="mt-16">
      {/* Service promises — the strip that answers "can I trust this shop?" */}
      <div className="border-y border-ink-200 bg-ink-50">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4">
            {site.highlights.map((highlight, index) => {
              const Icon = HIGHLIGHT_ICONS[index] ?? TruckIcon;
              return (
                <li key={highlight.title} className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-500 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-display text-sm font-bold tracking-tight text-ink-950 uppercase">
                      {highlight.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-600">{highlight.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Container>
      </div>

      <div className="bg-ink-950 text-ink-300">
        <Container>
          <div className="grid gap-10 py-14 lg:grid-cols-[22rem_1fr]">
            {/* Identity + contact */}
            <div>
              <Logo tone="onDark" className="h-14" />

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">{site.description}</p>

              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                  <span>
                    {site.address.street}
                    <br />
                    {site.address.district} / {site.address.city}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 shrink-0 text-brand-400" />
                  <a href={`tel:${site.phone}`} className="font-semibold text-white transition-colors hover:text-brand-400">
                    {formatPhone(site.phone)}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="h-5 w-5 shrink-0 text-brand-400" />
                  <a href={`mailto:${site.email}`} className="transition-colors hover:text-brand-400">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 shrink-0 text-brand-400" />
                  <span>{site.workingHours}</span>
                </li>
              </ul>

              <div className="mt-6 flex items-center gap-2">
                {[
                  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
                  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
                  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white transition-colors hover:bg-brand-500 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
              {Object.values(footerLinks).map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h3 className="font-display text-sm font-bold tracking-wide text-white uppercase">{column.title}</h3>
                  <span aria-hidden="true" className="mt-2 block h-0.5 w-8 bg-brand-400" />
                  <ul className="mt-4 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-sm text-ink-400 transition-colors hover:text-brand-400">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        </Container>

        {/* Hazard rule — a small nod to the workshop context */}
        <div aria-hidden="true" className="hazard-rule h-1.5 opacity-80" />

        <Container>
          <div className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
            <p>
              © {year} {site.legalName}. Tüm hakları saklıdır.
            </p>
            <p>
              Fiyatlara KDV dahildir. Görseller temsilidir; teknik değişiklik hakkı saklıdır.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
