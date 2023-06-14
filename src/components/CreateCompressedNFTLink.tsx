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
import {
  calculateClosestTreeDepth,
  getCreateCollectionTx,
  getCreateTreeTx,
} from "@/utils/compression";
import { CreateMetadataAccountArgsV3 } from "@metaplex-foundation/mpl-token-metadata";
import { VAULT_PUBLICKEY } from "@/lib/constants";
import axios from "axios";
import { confirmTransaction } from "@/utils/solana";

const MAX_FILE_SIZE = 5_24_49_280;

export const createLinkNFTFormSchema = z.object({
  collectionName: z.string(),
  collectionDescription: z.string().optional(),
  collectionSize: z.number().min(1),
  symbol: z.string(),
  network: z.enum(["devnet"]),
  image: z.instanceof(File),
});

interface CreateLinkDialogProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateCompressedNFTDialog = ({ setIsOpen }: CreateLinkDialogProps) => {
  const form = useForm<z.infer<typeof createLinkNFTFormSchema>>({
    resolver: zodResolver(createLinkNFTFormSchema),
    defaultValues: {
      network: "devnet",
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
    const connection = new Connection(
      data.network === "devnet"
        ? clusterApiUrl("devnet")
        : (process.env.NEXT_PUBLIC_MAINNET_RPC as string)
    );

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

    const collectionMetadata: CreateMetadataAccountArgsV3 = {
      data: {
        name: data.collectionName,
        symbol: data.symbol,
        uri: metadataUrl,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: false,
      collectionDetails: null,
    };

    const depth = calculateClosestTreeDepth(data.collectionSize);

    const {
      treeAddress,
      treeAuthority,
      tx: createTreeTx,
      treeKeypair,
    } = await getCreateTreeTx(
      connection,
      depth.sizePair,
      depth.canopyDepth,
      wallet.publicKey
    );

    console.log("tree address: ", treeAddress);
    console.log("tree authority: ", treeAuthority);

    const createTreeSig = await wallet.sendTransaction(
      createTreeTx,
      connection,
      { signers: [treeKeypair] }
    );

    await confirmTransaction(connection, createTreeSig);

    console.log("create tree sig: ", createTreeSig);

    const {
      masterEditionAccount,
      metadataAccount,
      mint,
      tokenAccount,
      tx: createCollectionTx,
      mintKeypair,
    } = await getCreateCollectionTx(
      connection,
      wallet.publicKey,
      collectionMetadata,
      data.collectionSize,
      wallet.publicKey
    );

    console.log("master edition account: ", masterEditionAccount);
    console.log("metadata account: ", metadataAccount);
    console.log("mint: ", mint);
    console.log("token account: ", tokenAccount);

    const createCollectionSig = await wallet.sendTransaction(
      createCollectionTx,
      connection,
      { signers: [mintKeypair] }
    );

    await confirmTransaction(connection, createCollectionSig);

    console.log("create collection sig: ", createCollectionSig);

    const res = await axios.post("/api/links/compressed-nfts", {
      collectionMintAddress: mint.toBase58(),
      treeAddress: treeAddress.toBase58(),
      name: data.collectionName,
      uri: metadataUrl,
    });

    console.log(res.data);

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
              <FormLabel required>Symbol</FormLabel>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>

                  <SelectContent>
                    {/* <SelectItem value="mainnet-beta">Mainnet</SelectItem> */}
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
