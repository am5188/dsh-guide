import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { UnitPage } from "@/components/UnitPage";
import { units } from "@/lib/curriculum";

export function generateStaticParams() {
  return units.map((u) => ({ no: String(u.no) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ no: string }>;
}): Promise<Metadata> {
  const { no } = await params;
  const unit = units.find((u) => String(u.no) === no);
  if (!unit) return { title: "找不到这一节" };
  return {
    title: `第 ${unit.no} 节 · ${unit.title} — DeepSeek Harness 使用指南`,
    description: unit.hook,
  };
}

export default async function UnitRoute({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const unit = units.find((u) => String(u.no) === no);
  if (!unit) notFound();
  return <UnitPage unit={unit} />;
}
