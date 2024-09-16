import { useCurrentWallet } from "@mysten/dapp-kit";
import siteConfig from "@/config";

export default function useNetwork() {
  const { currentWallet, isConnected } = useCurrentWallet();
  const currentNetwork =
    currentWallet?.accounts?.[0]?.chains?.[0]?.split(":")?.[1] ?? undefined;
  const expectedNetwork = siteConfig.SUI_NETWORK;
  const isWrongNetwork =
    currentNetwork !== undefined && currentNetwork !== expectedNetwork;

  return {
    isConnected,
    currentNetwork,
    isWrongNetwork,
    expectedNetwork,
  } as const;
}
