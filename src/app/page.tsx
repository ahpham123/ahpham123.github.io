import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SectionOverlay from "@/components/SectionOverlay";

export default function Home() {
  return (
    <>
      <div className="flex h-svh flex-col overflow-hidden">
        <Nav />
        <main id="main" className="relative flex-1">
          <Hero />
        </main>
      </div>
      <SectionOverlay />
    </>
  );
}
