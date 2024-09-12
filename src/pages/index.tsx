import React, { useState } from "react";
import {
  Button as NextUIButton,
  ButtonProps as NextUIButtonProps,
} from "@nextui-org/react";
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

// import { WalletStatus } from "@/components/WalletStatus";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
interface CustomButtonProps extends NextUIButtonProps {}

function Input(props: InputProps) {
  const isFileInput = props.type === "file";
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileName(file.name);
      if (props.onChange) {
        props.onChange(e);
      }
    }
  };

  return (
    <div className="relative w-full h-16">
      <input
        {...props}
        className={`w-full h-full bg-contain bg-no-repeat bg-center px-4 outline-none focus:outline-none border-none ${isFileInput ? "opacity-0 absolute inset-0 z-10 cursor-pointer" : ""} ${props.className || ""}`}
        style={{
          backgroundImage: isFileInput ? "none" : `url(/images/input-bg.svg)`,
          ...props.style,
        }}
        onChange={isFileInput ? handleFileChange : props.onChange}
      />
      {isFileInput && (
        <div
          className="absolute inset-0 flex items-center px-4 bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(/images/input-bg.svg)` }}
        >
          <span className="text-gray-500">{fileName || "Choose a file"}</span>
        </div>
      )}
    </div>
  );
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (props, ref) => {
    return (
      <NextUIButton
        {...props}
        ref={ref}
        className={`h-16 w-full bg-transparent text-white bg-contain bg-no-repeat bg-center ${props.className || ""}`}
        style={{
          backgroundImage: `url(/images/button-bg.svg)`,
          ...props.style,
        }}
      >
        {props.children}
      </NextUIButton>
    );
  }
);

CustomButton.displayName = "CustomButton";

export default function IndexPage() {
  const { isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [mintText, setMintText] = useState("I am very ok");
  const [mintImage, setMintImage] = useState<File | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const { mutate: storeObject, isPending } = useMutation({
    mutationFn: storeBlob,
    onSuccess: (data) => {
      console.log("存储成功:", data);
      const tx = createBottleTransaction(data.blobId, data.objectId);

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
              "successed create pool and stream, digest :",
              result.digest
            );
            toast.success("successed create pool and stream");
          },
        }
      );
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });

  const handleMint = async () => {
    if (isPending) return;

    if (mintText) {
      try {
        const checkResult = await checkTextWithAI(mintText);
        if (!checkResult.isAcceptable) {
          setAiSuggestion(checkResult.suggestions);
          toast.error("文本内容不适合，请查看建议并修改。");
          return;
        }
      } catch (error) {
        console.error("AI 检查失败:", error);
        toast.error("AI 检查失败，请稍后重试。");
        return;
      }
      console.log("mintText", mintText);
      storeObject(mintText);
    }
    if (mintImage) {
      console.log("mintImage", mintImage);
      storeObject(mintImage);
    }
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
                      setAiSuggestion(null); // 清除之前的建议
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
                    accept="image/*"
                    id="mint-amount"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) setMintImage(file);
                    }}
                  />
                </div>
              </div>

              {!isConnected ? (
                <ConnectModal
                  open={open}
                  trigger={
                    <CustomButton isDisabled={!!currentAccount}>
                      {" "}
                      {currentAccount ? "Connected" : "Connect"}
                    </CustomButton>
                  }
                  onOpenChange={(isOpen) => setOpen(isOpen)}
                />
              ) : (
                <CustomButton isLoading={isPending} onClick={handleMint}>
                  {isPending ? "Minting..." : "Mint"}
                </CustomButton>
              )}
            </div>
          </div>
        </section>
      </div>
    </DefaultLayout>
  );
}
