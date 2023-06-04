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
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import {} from "@metaplex-foundation/umi"
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import {
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";
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
  royalty: z.number().min(0.1).max(99.9).optional(),
  externalLink: z.string().url().optional(),
  network: z.enum(["mainnet-beta", "devnet"]),
  image: z.instanceof(File),
});

interface CreateLinkDialogProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateNFTLink = ({ setIsOpen }: CreateLinkDialogProps) => {
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
      external_url: data.externalLink,
    };

    const metadataUrl = await storage.upload(
      new File(
        [JSON.stringify(metadata)],
        `${data.collectionName}-metadata-${randomNumnber}.json`
      )
    );

    const metaplex = new Metaplex(
      new Connection(
        data.network === "devnet"
          ? clusterApiUrl("devnet")
          : (process.env.NEXT_PUBLIC_MAINNET_RPC as string)
      )
    ).use(walletAdapterIdentity(wallet));

    const collectionAuthority = Keypair.generate();

    const { nft: collectionNft } = await metaplex.nfts().create({
      name: data.collectionName,
      uri: metadataUrl,
      sellerFeeBasisPoints: data.royalty ?? 0 * 100,
      isCollection: true,
      updateAuthority: collectionAuthority,
    });

    const { candyMachine } = await metaplex.candyMachines().create({
      itemsAvailable: toBigNumber(data.collectionSize),
      sellerFeeBasisPoints: data.royalty ?? 0 * 100,
      collection: {
        address: collectionNft.address,
        updateAuthority: metaplex.identity(),
      },
    });

    console.log(candyMachine);

    // const umi = createUmi(
    //   data.network === "devnet"
    //     ? clusterApiUrl("devnet")
    //     : (process.env.NEXT_PUBLIC_MAINNET_RPC as string)
    // )
    //   .use(mplCandyMachine())
    //   .use(walletAdapterIdentity(wallet));

    // const collectionMint = generateSigner(umi);
    // const collectionUpdateAuthority = generateSigner(umi);

    // const nft = await createNft(umi, {
    //   mint: collectionMint,
    //   authority: collectionUpdateAuthority,
    //   name: data.collectionName,
    //   uri: metadataUrl,
    //   sellerFeeBasisPoints: percentAmount(data.royalty ?? 0, 2),
    //   isCollection: true,
    // }).sendAndConfirm(umi);

    // const candyMachine = generateSigner(umi);

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
          name="royalty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Royalty</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>The royalty of your collection.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="externalLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The external link of your collection.
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

export default CreateNFTLink;
