import { NextApiRequest, NextApiResponse } from "next";
import { NFTStorage, File } from "nft.storage";

const MAX_FILE_SIZE = 5_24_49_280;

const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const nftStorageKey = process.env.NFT_STORAGE_KEY;

  if (!nftStorageKey) {
    return res.status(500).json({ error: "NFT Storage key not found" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileBase64, fileType, name, fileExtension, description } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: "Missing file" });
  }

  const fileBuffer = Buffer.from(fileBase64, "base64");

  if (fileBuffer.length > MAX_FILE_SIZE) {
    return res.status(400).json({ error: "File too large" });
  }

  const nftStorage = new NFTStorage({ token: nftStorageKey });

  /// 4 digit random number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  try {
    const meta = await nftStorage.store({
      image: new File(
        [fileBuffer],
        `${name}-${randomNumber}.${fileExtension}`,
        { type: fileType }
      ),
      name: `${name}-${randomNumber}`,
      description,
    });

    return res.status(200).json({ meta });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload file" });
  }
};

export default uploadFile;
