"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import axios from "axios";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
interface DeleteLinkDialogProps {
  id: string;
  claimed: boolean;
}

const DeleteLinkDialog = ({ id, claimed }: DeleteLinkDialogProps) => {
  const router = useRouter();

  const [_isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={claimed}>
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this link?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You will get back the deposited tokens.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const toastId = toast.promise(
                  async () => {
                    const { data } = await axios.delete(`/api/links/${id}`);

                    if (!data.success) {
                      throw new Error("Error deleting link");
                    }

                    toast.success("Link deleted successfully", {
                      id: toastId,
                      action: {
                        label: "View Transaction",
                        onClick: () => {
                          window.open(
                            "https://explorer.solana.com/tx/" + data.returnSig,
                            "_blank"
                          );
                        },
                      },
                    });

                    startTransition(() => {
                      router.refresh();
                    });
                  },
                  {
                    loading: "Deleting link...",
                    success: () => {
                      return "Link deleted successfully";
                    },
                    error: () => {
                      return "Error deleting link";
                    },
                  }
                );
              }}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLinkDialog;
