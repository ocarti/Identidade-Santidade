import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { GallerySection } from "@/components/GallerySection";
import { EventDetailsSection } from "@/components/EventDetailsSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <TestimonialsSection />
        <GallerySection />
        <EventDetailsSection />
        <FAQSection />
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
};

export default Index;
