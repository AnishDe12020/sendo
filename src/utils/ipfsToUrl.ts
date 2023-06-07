const ipfsToUrl = (ipfsUrl: string) => {
  const cid = ipfsUrl.split("://").pop();
  if (!cid) {
    throw new Error("Invalid IPFS URL");
  }

  return `https://ipfs.io/ipfs/${cid}`;
};

export default ipfsToUrl;
