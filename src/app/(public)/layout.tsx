import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/shared/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
