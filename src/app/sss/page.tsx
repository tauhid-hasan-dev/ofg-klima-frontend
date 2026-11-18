import { StaticPage, staticPageMetadata } from "@/components/layout/StaticPage";

export const metadata = staticPageMetadata("sss");

export default function Page() {
  return <StaticPage slug="sss" />;
}
