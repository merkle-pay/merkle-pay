import nacl from "tweetnacl";
import bs58 from "bs58";

export function generateNaclKeysBs58Encoded() {
  const keypair = nacl.box.keyPair();

  return {
    publicKey: bs58.encode(keypair.publicKey),
    privateKey: bs58.encode(keypair.secretKey), // store this to decrypt response later
  };
}

export type PhantomConnectCallbackData = {
  public_key: string;
  session: string;
};
