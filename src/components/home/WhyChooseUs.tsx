import { whyChooseUs } from "@/lib/data";
import { DynamicIcon } from "@/lib/icons";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export function WhyChooseUs() {
  return (
    <Section id="why-us">
      <Container>
        <SectionHeader
          eyebrow="Why Pressora"
          title="Enterprise reliability, boutique craft"
          description="Everything you need to print at scale—without the headaches of traditional vendors."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item) => (
            <Card
              key={item.title}
              hover
              className="group p-6 transition-all duration-300 hover:border-primary/20"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <DynamicIcon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
