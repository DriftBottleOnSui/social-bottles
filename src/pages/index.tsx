import { useState } from "react";
import toast from "react-hot-toast";
import {
  ConnectModal,
  useCurrentWallet,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";

import { storeBlob, createBottleTransaction, checkTextWithAI } from "@/utils";
import DefaultLayout from "@/layouts/default";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function IndexPage() {
  const { isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [mintText, setMintText] = useState("I am very ok");
  const [mintImage, setMintImage] = useState<File | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { mutate: storeObject, isPending } = useMutation({
    mutationFn: (input: (File | string)[]) => storeBlob(input),
    onSuccess: (data) => {
      console.log("Storage successful:", data);
      const tx = createBottleTransaction(data);

      console.log("tx", tx);
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onError: (err: Error) => {
            console.error(err.message);
            toast.error(err.message);
          },
          onSuccess: (result) => {
            console.log(
              "Successfully created pool and stream, digest :",
              result.digest,
            );
            toast.success("Successfully created pool and stream");
          },
        },
      );
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });

  const handleMint = async () => {
    if (isPending) return;

    const toStore = [];

    if (mintText) {
      try {
        setIsChecking(true);
        const checkResult = await checkTextWithAI(mintText);

        if (!checkResult.isAcceptable) {
          setAiSuggestion(checkResult.suggestions);
          toast.error(
            "Text content is not suitable. Please review the suggestions and modify.",
          );

          return;
        }
      } catch (error) {
        console.error("AI check failed:", error);
      } finally {
        setIsChecking(false);
      }
      toStore.push(mintText);
    }
    if (mintImage) {
      if (mintImage.type !== "image/jpeg" && mintImage.type !== "image/png") {
        toast.error("Please upload a JPG or PNG image");

        return;
      }
      if (mintImage.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB");

        return;
      }
      toStore.push(mintImage);
    }
    if (toStore.length === 0) {
      toast.error("Please enter text or upload an image");

      return;
    }
    storeObject(toStore);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-7xl px-2 md:px-6 pt-16">
        <section
          className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 bg-cover bg-no-repeat bg-center "
          style={{
            backgroundImage: `url(/images/home-bg.png)`,
          }}
        >
          <div
            className="mint-form w-full max-w-2xl aspect-[25/19] bg-contain bg-no-repeat bg-center rounded-lg overflow-hidden relative"
            style={{
              backgroundImage: `url(/images/form-bg.png)`,
            }}
          >
            <div className="form-container h-full p-[8%] bg-transparent">
              <div
                className="title w-full bg-contain bg-no-repeat bg-center flex items-center justify-center py-4"
                style={{
                  backgroundImage: `url(/images/title-bg.svg)`,
                }}
              >
                <h1 className="text-white text-center text-2xl font-bold">
                  Mint Bottles
                </h1>
              </div>
              {/* <WalletStatus /> */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <label htmlFor="mint-amount">Description</label>
                  <Input
                    id="mint-amount"
                    value={mintText}
                    onChange={(e) => {
                      setMintText(e.target.value);
                      setAiSuggestion(null); // Clear previous suggestions
                    }}
                  />
                </div>
                {aiSuggestion && (
                  <p className="text-red-500 text-sm mt-1">{aiSuggestion}</p>
                )}
                <p className="text-center">Or</p>
                <div className="flex flex-col">
                  <label htmlFor="mint-amount">Upload Image</label>
                  <Input
                    accept="image/jpeg, image/png"
                    id="mint-amount"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file && file.size <= 5 * 1024 * 1024) {
                        setMintImage(file);
                      } else {
                        toast.error("The file size must be less than 5MB");
                      }
                    }}
                  />
                </div>
              </div>

              {!isConnected ? (
                <ConnectModal
                  open={open}
                  trigger={
                    <Button isDisabled={!!currentAccount}>
                      {" "}
                      {currentAccount ? "Connected" : "Connect"}
                    </Button>
                  }
                  onOpenChange={(isOpen) => setOpen(isOpen)}
                />
              ) : (
                <Button
                  isLoading={isPending || isChecking}
                  onClick={handleMint}
                >
                  {isPending ? "Minting..." : "Mint"}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </DefaultLayout>
  );
}
