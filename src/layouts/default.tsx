import { Toaster } from "react-hot-toast";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Toaster />
    </div>
  );
}
