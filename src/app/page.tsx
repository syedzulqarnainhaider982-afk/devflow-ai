import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustedBy from "@/components/home/TrustedBy";
import Features from "@/components/home/Features";
import AIToolsShowcase from "@/components/home/AIToolsShowcase";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar isAuthenticated={isAuthenticated} />
      <HeroSection isAuthenticated={isAuthenticated} />
      <TrustedBy />
      <WhyChooseUs />
      <Features />
      <AIToolsShowcase />
      <Testimonials />
      <Pricing isAuthenticated={isAuthenticated} />
      <FAQ />
      <CTASection isAuthenticated={isAuthenticated} />
      <Footer />
    </main>
  );
}
