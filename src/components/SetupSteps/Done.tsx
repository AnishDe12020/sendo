import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const Done = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h2 className="text-3xl font-bold">Your wallet is ready!</h2>

      <Button onClick={() => router.push("/wallet")}>
        Take me to my wallet
        <ArrowRight className="inline-block w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default Done;
