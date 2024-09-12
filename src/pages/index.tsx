import React, { useState } from "react";
import DefaultLayout from "@/layouts/default";
import {
  Button as NextUIButton,
  ButtonProps as NextUIButtonProps,
} from "@nextui-org/react";

// import { WalletStatus } from "@/components/WalletStatus";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useConnectWallet } from "@mysten/dapp-kit";

import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface CustomButtonProps extends NextUIButtonProps {
  // 如果需要添加额外的属性，可以在这里定义
}

function Input(props: InputProps) {
  const isFileInput = props.type === "file";
  return (
    <div className="relative w-full h-16">
      <input
        {...props}
        className={`w-full h-full bg-contain bg-no-repeat bg-center px-4 outline-none focus:outline-none border-none ${isFileInput ? "opacity-0 absolute inset-0 z-10 cursor-pointer" : ""} ${props.className || ""}`}
        style={{
          backgroundImage: isFileInput ? "none" : `url(/images/input-bg.svg)`,
          ...props.style,
        }}
      />
      {isFileInput && (
        <div
          className="absolute inset-0 flex items-center px-4 bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(/images/input-bg.svg)` }}
        >
          <span className="text-gray-500"></span>
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
  const { connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  return (
    <DefaultLayout>
      <section
        className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 bg-cover bg-no-repeat bg-center"
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
                <Input id="mint-amount" />
              </div>
              <p className="text-center">Or</p>
              <div className="flex flex-col">
                <label htmlFor="mint-amount">Upload Image</label>
                <Input id="mint-amount" type="file" accept="image/*" />
              </div>
            </div>
            {/* className="w-full bg-[#fb0c0c] text-white hover:bg-[#d80a0a]" */}

            {!isConnected ? (
              <ConnectModal
                trigger={
                  <CustomButton isDisabled={!!currentAccount}>
                    {" "}
                    {currentAccount ? "Connected" : "Connect"}
                  </CustomButton>
                }
                open={open}
                onOpenChange={(isOpen) => setOpen(isOpen)}
              />
            ) : (
              <CustomButton onClick={connect}>Mint</CustomButton>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
