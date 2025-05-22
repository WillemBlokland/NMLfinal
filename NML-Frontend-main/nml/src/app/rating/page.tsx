import { Suspense } from "react";
import RatingClient from "./RatingClient.tsx";

export const dynamic = "force-dynamic";

export default function RatingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RatingClient />
    </Suspense>
  );
}
