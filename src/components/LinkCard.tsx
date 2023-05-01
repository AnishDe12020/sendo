"use client";

import { SUPPORTED_SPL_TOKENS, TOKEN_SOL } from "@/lib/tokens";
import { Link } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { ClipboardIcon, ExternalLinkIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
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

interface LinkCardProps {
  link: Link;
}

const LinkCard = ({ link }: LinkCardProps) => {
  const [_isPending, startTransition] = useTransition();

  const router = useRouter();

  return (
    <div
      key={link.id}
      className="flex flex-row justify-between w-full p-4 border shadow-md rounded-xl bg-card text-secondary-foreground"
    >
      <div className="flex flex-row">
        <img
          src={
            link.token === "SOL"
              ? TOKEN_SOL.logoURI
              : SUPPORTED_SPL_TOKENS[
                  link.symbol as keyof typeof SUPPORTED_SPL_TOKENS
                ].logoURI
          }
          alt={link.token === "SOL" ? "SOL" : (link.symbol as string)}
          className="w-8 h-8 rounded-lg"
        />

        <div className="flex flex-col gap-4 ml-4">
          <div className="flex flex-row items-center gap-4">
            <p className="text-lg font-semibold">
              {link.amount} {link.token === "SOL" ? "SOL" : link.symbol}
            </p>
            {link.claimed ? (
              <Badge>Claimed</Badge>
            ) : (
              <Badge variant="outline">Not claimed</Badge>
            )}
          </div>
          {link.message && <p className="text-sm">{link.message}</p>}
          <p className="text-sm text-gray-300">
            Created on {format(link.createdAt, "PPpp")}
          </p>
          {link.claimed && (
            <div className="flex flex-row gap-4 ">
              <p className="text-sm text-gray-300">
                Claimed on {format(link.claimedAt as Date, "PPpp")}
              </p>

              <Button
                onClick={() => {
                  window.open(
                    "https://explorer.solana.com/tx/" + link.claimTx,
                    "_blank"
                  );
                }}
              >
                View Transaction
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            window.open(window.location.origin + "/links/" + link.id, "_blank");
          }}
        >
          <ExternalLinkIcon className="w-4 h-4 mr-2" />
          Open
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.origin + "/links/" + link.id
            );
            toast.success("Copied to clipboard");
          }}
        >
          <ClipboardIcon className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={link.claimed}>
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
                        const { data } = await axios.delete(
                          `/api/links/${link.id}`
                        );

                        if (!data.success) {
                          throw new Error("Error deleting link");
                        }

                        toast.success("Link deleted successfully", {
                          id: toastId,
                          action: {
                            label: "View Transaction",
                            onClick: () => {
                              window.open(
                                "https://explorer.solana.com/tx/" +
                                  data.returnSig,
                                "_blank"
                              );
                            },
                          },
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

                    startTransition(() => {
                      router.refresh();
                    });
                  }}
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LinkCard;
