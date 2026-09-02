import type { Metadata } from "next";
import MyForest from "./MyForest";

export const metadata: Metadata = {
  title: "My Forest",
  description: "Your trees, their stages, and the funding record behind each one.",
};

export default function ForestPage() {
  return <MyForest />;
}
