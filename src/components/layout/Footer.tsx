import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/ui/icons";
import { formatPhone, whatsappLink } from "@/lib/format";
import { getCategoryRail } from "@/lib/repository";
import { footerLinks, site } from "@/lib/site";

/**
 * A photograph per promise, in the order `site.highlights` declares them.
 *
 * Three come from the project's own product photography and earn their place
 * literally: the boxed part for same-day despatch, a branded compressor for
 * genuine-and-equivalent, a hand on the work for technical support. The
 * fourth is a card payment, which no amount of compressor photography can
 * stand in for — that one is CC0 (public domain) and, unlike the rest of
 * public/banners, is cleared for any use.
 */
const PROMISE_PHOTOS = [
  { src: "/banners/hero-3.jpg", focus: "68% center" },
  { src: "/banners/hero-1.jpg", focus: "62% center" },
  { src: "/banners/footer-about.png", focus: "center" },
  { src: "/banners/payment.jpg", focus: "center" },
] as const;

/** Manufacturers given their own line in the compressor column. */
const FOOTER_BRANDS = ["sanden", "wutse", "denso", "valeo"] as const;

/** Top-level groups that already have their own column, so they are not repeated. */
const OWN_COLUMN = new Set(["klima-kompresoru", "kompresor-yedek-parca", "arac-markasina-gore-kompresor"]);

/**
 * Links per directory column.
 *
 * Capped rather than printed in full: "Kompresör Yedek Parça" has fourteen
 * children, and letting it run left the other three columns ending halfway up
 * a wall of its links. Nine is the longest column the row carries without
 * looking ragged, and a capped column ends in a "Tümünü gör" link so nothing
 * is actually unreachable.
 */
const COLUMN_LIMIT = 9;

const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${site.address.street}, ${site.address.district}/${site.address.city}`,
)}`;

/**
 * Site footer, laid out like the reference storefront's.
 *
 * Four bands:
 *
 *   promises    white — four photo cards, one per service promise
 *   main        navy — brand block (logo, photo, blurb, social) on the left;
 *               "Bize Ulaşın" plus the corporate and help columns right
 *   directory   navy — a wide category menu, three groups across
 *   legal       navy — copyright and the small print
 *
 * The directory is the part worth keeping: on a catalogue this size it is the
 * one place every group is reachable in a single view, and it is what makes
 * the footer worth scrolling to rather than just a legal strip.
 *
 * Its links are read from the repository rather than listed by hand, so a
 * category added to the fixtures appears here and one that is removed cannot
 * leave a dead link behind. That is also why this component is async.
 */
export async function Footer() {
  const year = 2026;
  const { tops, childrenBySlug } = await getCategoryRail();

  const byName = new Map(tops.map((category) => [category.slug, category.name]));

  const directory = [
    {
      title: byName.get("klima-kompresoru") ?? "Klima Kompresörü",
      href: "/kategori/klima-kompresoru",
      links: [
        ...(childrenBySlug["klima-kompresoru"] ?? []).map((child) => ({
          label: child.name,
          href: `/kategori/${child.slug}`,
        })),
        // The reference lists the big compressor makes here too — they are the
        // terms people actually search for.
        ...FOOTER_BRANDS.map((slug) => ({
          label: `${slug[0].toUpperCase()}${slug.slice(1)} Klima Kompresörü`,
          href: `/marka/${slug}`,
        })),
      ],
    },
    {
      title: "Oto Klima Yedek Parça",
      href: "/marka",
      links: tops
        .filter((category) => !OWN_COLUMN.has(category.slug))
        .map((category) => ({ label: category.name, href: `/kategori/${category.slug}` })),
    },
    {
      title: byName.get("kompresor-yedek-parca") ?? "Kompresör Yedek Parça",
      href: "/kategori/kompresor-yedek-parca",
      links: (childrenBySlug["kompresor-yedek-parca"] ?? []).map((child) => ({
        label: child.name,
        href: `/kategori/${child.slug}`,
      })),
    },
  ].map((group) => ({ ...group, links: group.links.slice(0, COLUMN_LIMIT) }));

  return (
    <footer className="mt-16">
      {/*
        Service promises — the strip that answers "can I trust this shop?".

        Photographs rather than glyphs. Four line icons in a row is the stock
        answer and reads as stock: a photograph of the actual boxed product,
        of a hand on the actual part, is the claim itself rather than a
        pictogram of it. No background or rule either — on a white page the
        cards are their own container, and the band the strip used to sit in
        only served to fence it off from the section above.
      */}
      <div className="py-14">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {site.highlights.map((highlight, index) => {
              const photo = PROMISE_PHOTOS[index] ?? PROMISE_PHOTOS[0];
              return (
                <li
                  key={highlight.title}
                  className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-200 transition-shadow duration-200 hover:shadow-card-hover"
                >
                  {/* navy-950 underneath so a photo that has not decoded yet
                      shows as the dark band it will become, not as white. */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy-950">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: photo.focus }}
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-sm font-bold tracking-tight text-ink-950 uppercase">
                      {highlight.title}
                    </h3>
                    <p className="mt-1.5 text-[0.85rem] leading-snug text-ink-600">{highlight.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </div>

      {/* Deep blue, graded rather than flat: the band is tall enough that one
          solid navy read as a slab, and lightening the top edge lets it
          receive the white section above instead of butting against it. */}
      <div className="bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950 text-navy-200">
        <Container>
          {/* ── Brand block + contact + link columns ─────────────────── */}
          <div className="grid gap-10 py-14 lg:grid-cols-[21rem_1fr] lg:gap-14">
            <div>
              <Logo tone="onDark" className="h-14" />

              {/*
                Photo above the blurb and running the full width of the
                column, rather than a thumbnail with the text wrapped beside
                it. At 120px the old one was too small to read as anything;
                given the whole column it is a picture of the stock.

                hero-2 rather than the workshop shot that used to be here —
                that one moved up to the promises strip, where "a hand on the
                work" is exactly what "Teknik Destek" needed. 2560px wide, so
                it has the resolution this size now demands.
              */}
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-navy-950 ring-1 ring-white/10">
                <Image
                  src="/banners/hero-2.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 21rem, 92vw"
                  className="object-cover"
                  style={{ objectPosition: "64% center" }}
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-navy-300">
                Oto klima yedek parça ihtiyaçlarınızda doğru parçayı birlikte seçelim —{" "}
                <span className="font-semibold text-white">{site.legalName}</span> güvencesiyle.
              </p>

              <div className="mt-6 flex items-center gap-2">
                {[
                  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
                  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
                  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
                  {
                    href: whatsappLink(site.whatsapp, "Merhaba, bilgi almak istiyorum."),
                    label: "WhatsApp",
                    Icon: WhatsAppIcon,
                  },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-500"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 sm:gap-y-9 lg:grid-cols-[1.35fr_1fr_1fr]">
              {/* Bize Ulaşın — every line labelled, as on the reference. A bare
                  icon beside a string of digits leaves the reader to work out
                  whether it is the phone, the WhatsApp line or the fax. */}
              <section aria-labelledby="footer-contact">
                <ColumnTitle id="footer-contact">Bize Ulaşın</ColumnTitle>
                <ul className="mt-4 space-y-3 text-sm">
                  <ContactRow Icon={PhoneIcon} label="Telefon" href={`tel:${site.phone}`} strong>
                    {formatPhone(site.phone)}
                  </ContactRow>
                  <ContactRow
                    Icon={WhatsAppIcon}
                    label="WhatsApp"
                    href={whatsappLink(site.whatsapp, "Merhaba, bilgi almak istiyorum.")}
                    external
                    strong
                  >
                    {formatPhone(site.whatsapp)}
                  </ContactRow>
                  <ContactRow Icon={MailIcon} label="E-posta" href={`mailto:${site.email}`}>
                    {site.email}
                  </ContactRow>
                  <ContactRow Icon={ClockIcon} label="Çalışma Saatleri">
                    {site.workingHours}
                  </ContactRow>
                  <ContactRow Icon={MapPinIcon} label="Adres" href={mapsUrl} external>
                    {site.address.street}
                    <br />
                    {site.address.district} / {site.address.city}
                  </ContactRow>
                </ul>
              </section>

              {[footerLinks.kurumsal, footerLinks.yardim].map((column) => (
                <LinkColumn key={column.title} title={column.title} links={column.links} />
              ))}
            </div>
          </div>

          {/* ── Category directory ───────────────────────────────────── */}
          <div className="grid gap-x-6 gap-y-4 border-t border-white/10 py-10 sm:grid-cols-2 sm:gap-y-9 sm:py-12 lg:grid-cols-4">
            {directory.map((group) => (
              <LinkColumn key={group.title} title={group.title} href={group.href} links={group.links} />
            ))}
            <LinkColumn title={footerLinks.sozlesmeler.title} links={footerLinks.sozlesmeler.links} />
          </div>
        </Container>

        <div aria-hidden="true" className="border-t border-white/10" />

        <Container>
          {/* navy-300, not ink-500: the neutral grey that worked on the old
              near-black footer is 3:1 on navy and the small print vanished. */}
          <div className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-navy-300 sm:flex-row">
            <p>
              © {year} {site.legalName}. Tüm hakları saklıdır.
            </p>
            <p>Fiyatlara KDV dahildir. Görseller temsilidir; teknik değişiklik hakkı saklıdır.</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function ColumnTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <>
      <h3 id={id} className="font-display text-sm font-bold tracking-wide text-white uppercase">
        {children}
      </h3>
      <span aria-hidden="true" className="mt-2 block h-0.5 w-8 bg-brand-500" />
    </>
  );
}

const TR_ASCII: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
};

/**
 * Stable DOM id from a Turkish column title.
 *
 * The accented letters are transliterated rather than stripped: without it
 * "Klima Kompresörü" becomes `klima-kompres-r-`, which works but is horrible
 * to read in the markup and in a test selector.
 */
function columnId(title: string) {
  const slug = title
    .toLocaleLowerCase("tr")
    .replace(/[çğıİöşüâîû]/g, (letter) => TR_ASCII[letter] ?? letter)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `footer-col-${slug}`;
}

/**
 * One footer column, collapsible below sm.
 *
 * The obvious tool here is `<details>`, and it was the first attempt — but it
 * cannot be forced open again at a breakpoint. Chrome hides a closed details
 * through `::details-content` with `content-visibility`, not through
 * `display` on the children, and Lightning CSS (which Tailwind v4 runs over
 * this stylesheet) strips that pseudo-element out of the build, so the rule
 * that would re-show it never reaches the browser. Rendering `<details open>`
 * instead just means the phone gets the wall of links the accordion exists to
 * avoid.
 *
 * So: a checkbox and a label, the CSS-only disclosure. It needs no client
 * component, every link stays in the HTML for crawlers whether open or shut,
 * and `sm:block` wins over `peer-checked:block` at the breakpoint, so a
 * column left closed on a phone is still open on a desktop. The cost is that
 * the control announces as a checkbox rather than as a disclosure; the links
 * themselves stay inside a labelled <nav>, so the structure is still
 * navigable.
 */
function LinkColumn({
  title,
  href,
  links,
}: {
  title: string;
  /** Shows a "see all" line under a column whose list has been trimmed. */
  href?: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  if (links.length === 0) return null;

  const id = columnId(title);

  return (
    <div className="border-b border-white/10 pb-3 last:border-0 sm:border-0 sm:pb-0">
      <input type="checkbox" id={id} className="peer sr-only" />

      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between gap-3 py-1 peer-checked:[&>svg]:rotate-180 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white sm:pointer-events-none sm:py-0"
      >
        <span className="min-w-0">
          <ColumnTitle>{title}</ColumnTitle>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-navy-300 transition-transform duration-200 sm:hidden"
        />
      </label>

      <nav aria-label={title} className="hidden peer-checked:block sm:block">
        <ul className="mt-4 space-y-2.5">
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link href={link.href} className="text-sm text-navy-300 transition-colors hover:text-brand-400">
                {link.label}
              </Link>
            </li>
          ))}
          {href ? (
            <li>
              <Link
                href={href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-brand-400"
              >
                Tümünü gör
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </div>
  );
}

function ContactRow({
  Icon,
  label,
  href,
  external,
  strong,
  children,
}: {
  Icon: (props: { className?: string }) => React.ReactElement;
  label: string;
  href?: string;
  external?: boolean;
  /** Phone numbers get the display face — they are the thing being scanned for. */
  strong?: boolean;
  children: React.ReactNode;
}) {
  const value = (
    <span className={strong ? "font-display font-bold tracking-tight text-white tabular" : "text-navy-200"}>
      {children}
    </span>
  );

  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-[1.1rem] w-[1.1rem] shrink-0 text-brand-400" />
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-semibold tracking-wide text-navy-400 uppercase">{label}</span>
        {href ? (
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="transition-colors hover:text-brand-400"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </li>
  );
}
