import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdhereBanner from "@/components/AdhereBanner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 140px)" }}>
        {children}
      </main>
      <AdhereBanner />
      <Footer />
    </>
  );
}
