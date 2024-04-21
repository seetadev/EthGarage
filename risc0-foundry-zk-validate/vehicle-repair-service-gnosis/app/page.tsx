"use client";

import { useAccount, useSendTransaction, useSignMessage } from "wagmi";
import { parseEther } from "viem";

export default function Home() {
  const { isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="gap-4 flex flex-col items-center">
        {isConnected && (
          <div className="flex gap-4">
            <button
              onClick={() => signMessage({ message: "gm" })}
              className="text-neutral-300 bg-neutral-900 px-4 py-2 rounded-md"
            >
              Sign Message
            </button>
            <button
              onClick={() =>
                sendTransaction({
                  to: "0x4a8f300114F6a3CEd6847f8Cb18264C2d9B82d59",
                  value: parseEther("0.01"),
                })
              }
              className="text-neutral-300 bg-neutral-900 px-4 py-2 rounded-md"
            >
              Send Transaction
            </button>
          </div>
        )}

        <w3m-button />
      </div>
    </main>
  );
}
