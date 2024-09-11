"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";

import { OwnedObjects } from "./OwnedObjects";

export function WalletStatus() {
  const account = useCurrentAccount();

  return (
    <div className="container my-2">
      <h4>Wallet Status</h4>

      {account ? (
        <div>
          <div>Wallet connected</div>
          <div>Address: {account.address}</div>
        </div>
      ) : (
        <div>Wallet not connected</div>
      )}
      <OwnedObjects />
    </div>
  );
}
