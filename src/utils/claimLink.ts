import axios from "axios";
import Sentry from "@sentry/nextjs";
import { toast } from "sonner";

export const claimToken = async (id: string, claimerAddress: string) => {
  try {
    const { data } = await axios.post(`/api/links/${id}`, {
      claimerAddress,
    });

    if (!data.success) {
      Sentry.captureException(data);
      throw new Error("Failed to claim link");
    }

    const { transferSig } = data;

    return { success: true, signature: transferSig };
  } catch (err) {
    toast.error("Failed to claim link");

    return { success: false };
  }
};

export const claimCandymachineNFT = async (
  id: string,
  claimerAddress: string
) => {
  try {
    const { data } = await axios.post(`/api/candy-machine-links/${id}`, {
      claimerAddress,
    });

    if (!data.success) {
      Sentry.captureException(data);
      throw new Error("Failed to claim link");
    }

    const { signature } = data;

    return { success: true, signature };
  } catch (err) {
    console.log(err);
    toast.error("Failed to mint NFT");
    return { success: false };
  }
};
