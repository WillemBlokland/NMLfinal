import { Suspense } from "react";
import TextClient from "./TextClient";

export const dynamic = "force-dynamic";

export default function TextPage() {
  return (
    <Suspense fallback={<div>Loading story...</div>}>
      <TextClient />
    </Suspense>
  );
}
