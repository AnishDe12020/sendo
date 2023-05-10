import { KeyData } from "@/types/key";
import { atomWithStorage } from "jotai/utils";

const keyAtom = atomWithStorage<KeyData | null>("keyData", null);

export default keyAtom;
