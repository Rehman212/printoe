import type { Metadata } from "next";
import { CustomProductBuilder } from "@/components/products/CustomProductBuilder";

export const metadata: Metadata = {
  title: "Custom Product Builder",
  description:
    "Build custom print jobs with your size, paper, folding, and finishing options — Offset or Signs.",
};

export default function CustomPrintingPage() {
  return <CustomProductBuilder />;
}
