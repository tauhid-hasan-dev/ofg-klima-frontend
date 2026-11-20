import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Persistent WhatsApp affordance. In this market most enquiries ("hangi parça
 * benim araca uyar?") arrive over WhatsApp rather than email, so it stays
 * reachable from every page.
 *
 * Deliberately icon-only: a wide pill sits on top of the right-hand column of
 * the product grid and covers a real "Sepete Ekle" button. The label is
 * revealed to the left on hover/focus, which costs no layout space.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(site.whatsapp, "Merhaba, aracım için doğru parçayı seçmek istiyorum.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geçin"
      className="group fixed right-4 bottom-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-whatsapp text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.65)] transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[calc(100%+0.625rem)] hidden rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
      >
        WhatsApp Destek
      </span>
    </a>
  );
}
