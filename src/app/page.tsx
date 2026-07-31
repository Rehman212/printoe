import {
  HeroSection,
  ShopShowcase,
  CategoryGrid,
  ProcessSection,
  WhyChooseUs,
  PriceCalculator,
  PortfolioGallery,
  TestimonialsSlider,
  StatsCounters,
  ServicesSection,
  BlogPreview,
  NewsletterSection,
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
      <PortfolioGallery />
      <TestimonialsSlider />
      <StatsCounters />
      <ServicesSection />
      <BlogPreview />
      <NewsletterSection />
    </>
  );
}
