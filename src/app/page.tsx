import CreateLinkDialog from "@/components/CreateLinkDialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full mt-8 space-x-4">
      <h1 className="mb-16 text-5xl font-bold">Onsol Demo</h1>

      <CreateLinkDialog />
    </div>
  );
}
