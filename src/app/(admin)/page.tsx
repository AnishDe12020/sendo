"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Home = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h1 className="mb-16 text-5xl font-bold">Onsol Demo</h1>

      <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
    </div>
  );
};

export default Home;
