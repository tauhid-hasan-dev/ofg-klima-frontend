import { StaticPage, staticPageMetadata } from "@/components/layout/StaticPage";

export const metadata = staticPageMetadata("hesap");

export default function Page() {
  return <StaticPage slug="hesap" />;
}
