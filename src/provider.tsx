import { NextUIProvider } from "@nextui-org/system";
import { useNavigate } from "react-router-dom";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import siteConfig from "@/config";

import { networkConfig } from "./networkConfig";
const queryClient = new QueryClient();

const suiNetwork = siteConfig.SUI_NETWORK as
  | "testnet"
  | "mainnet"
  | "devnet"
  | undefined;
export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider defaultNetwork={suiNetwork} networks={networkConfig}>
          <WalletProvider autoConnect>{children}</WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </NextUIProvider>
  );
}
