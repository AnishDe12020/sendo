import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

import { ThirdwebStorage } from "@thirdweb-dev/storage";
import {
  Metaplex,
  toBigNumber,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";

const MAX_FILE_SIZE = 5_24_49_280;

export const createLinkNFTFormSchema = z.object({
  collectionName: z.string(),
  collectionDescription: z.string().optional(),
  collectionSize: z.number().min(1),
  symbol: z.string().optional(),
  network: z.enum(["mainnet-beta", "devnet"]),
  image: z.instanceof(File),
});

interface CreateLinkDialogProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateCompressedNFTDialog = ({ setIsOpen }: CreateLinkDialogProps) => {
  const form = useForm<z.infer<typeof createLinkNFTFormSchema>>({
    resolver: zodResolver(createLinkNFTFormSchema),
    defaultValues: {
      network: "mainnet-beta",
    },
  });

  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const wallet = useWallet();
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);

    setIsCreatingLink(true);

    if (!wallet.publicKey) {
      console.error("public key is not defined");
      return;
    }

    const storage = new ThirdwebStorage();

    const randomNumnber = Math.floor(Math.random() * 1000000000);

    const imageUrl = await storage.upload(data.image);

    const metadata = {
      name: data.collectionName,
      symbol: data.symbol,
      description: data.collectionDescription,
      image: imageUrl,
    };

    const metadataUrl = await storage.upload(
      new File(
        [JSON.stringify(metadata)],
        `${data.collectionName}-metadata-${randomNumnber}.json`
      )
    );

    startTransition(() => {
      router.refresh();
    });

    setIsCreatingLink(false);

    setIsOpen(false);
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="collectionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Collection name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The name of your collection.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collectionDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The description of your collection. characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collectionSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Collection size</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  type="number"
                />
              </FormControl>
              <FormDescription>
                The number of NFTs in your collection.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The symbol of your collection. characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Network</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="mainnet-beta">Mainnet</SelectItem>
                    <SelectItem value="devnet">Devnet</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>The network of your collection.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Image</FormLabel>
              <FormDescription>
                The image for you NFT Collection
              </FormDescription>
              <FormControl>
                <Dropzone
                  onDropAccepted={(acceptedFiles) => {
                    field.onChange(acceptedFiles[0]);
                  }}
                  onDropRejected={(fileRejections: FileRejection[]) => {
                    toast.error(fileRejections[0].errors[0].message);
                  }}
                  accept={{
                    "image/*": ["*"],
                  }}
                  maxSize={MAX_FILE_SIZE}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      className="flex flex-col items-center justify-center w-full gap-4 p-4 text-center transition duration-150 border-2 border-gray-700 border-dashed cursor-pointer rounded-xl hover:border-gray-500"
                    >
                      <input {...getInputProps()} />

                      {isDragActive ? (
                        <p>Drop here</p>
                      ) : field.value ? (
                        <div className="flex flex-col items-center justify-center w-full gap-4">
                          <img src={URL.createObjectURL(field.value)} />
                          <p>{field.value.name}</p>
                        </div>
                      ) : (
                        <p>
                          Drag and drop the image for the NFT here or click to
                          select the file
                        </p>
                      )}
                    </div>
                  )}
                </Dropzone>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="mt-6">
          <Button type="submit" isLoading={isCreatingLink}>
            Create link
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateCompressedNFTDialog;
