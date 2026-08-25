import {
  HeroSection,
  ShopShowcase,
  CategoryGrid,
  ProcessSection,
  WhyChooseUs,
  PriceCalculator,
  TestimonialsSlider,
  StatsCounters,
  BlogPreview,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ShopShowcase />
      <CategoryGrid />
      <ProcessSection />
      <WhyChooseUs />
      <PriceCalculator />
      <TestimonialsSlider />
      <StatsCounters />
      <BlogPreview />
    </>
  );
}
