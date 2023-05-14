import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { atom } from "jotai";

export const web3AuthAtom = atom<Web3AuthCore | null>(null);
export const web3AuthProviderAtom = atom<SafeEventEmitterProvider | null>(null);
