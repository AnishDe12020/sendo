import { ReactNode } from "react";

const WalletLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center w-full mt-8 ">
      <h1 className="mb-16 text-5xl font-bold">Onsol Wallet</h1>
      {children}
    </div>
  );
};

export default WalletLayout;
