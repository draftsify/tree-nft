import type { Metadata } from "next";
import AdminConsole from "./AdminConsole";

export const metadata: Metadata = {
  title: "Verification console — Tree",
  description:
    "Internal view: file a partner report, attach evidence, and advance the tokens it covers.",
};

export default function AdminPage() {
  return <AdminConsole />;
}
