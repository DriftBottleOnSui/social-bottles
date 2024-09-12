import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

import siteConfig from "./config";

const WALRUS_PUBLISHER_URL = siteConfig.WALRUS_PUBLISHER_URL;
const WALRUS_AGGREGATOR_URL = siteConfig.WALRUS_AGGREGATOR_URL;
const numEpochs = 1;

const CONTRACT_ADDRESS =
  "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7";

// const EventType = `${CONTRACT_ADDRESS}::drift_bottle::BottleEvent`;
const CreateBottleMethod = `${CONTRACT_ADDRESS}::drift_bottle::createBottle`;
const ReplyBottleMethod = `${CONTRACT_ADDRESS}::drift_bottle::openAndReplyBottle`;

export function createBottleTransaction(blobId: string, txId: string) {
  const tx = new Transaction();

  tx.moveCall({
    target: CreateBottleMethod,
    arguments: [
      tx.pure.string(blobId),
      tx.pure.address(txId),
      tx.object("0x6"),
    ],
  });

  return tx;
}

export async function checkTextWithAI(text: string): Promise<{
  isAcceptable: boolean;
  suggestions: string | null;
}> {
  const response = await fetch("https://ai-as-api.lerry.me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const result = (await response.json()) as {
    assessment: "适当" | "不适当";
    suggestions: string | null;
  } | null;

  if (!result) {
    throw new Error("AI 检查失败");
  }

  return {
    isAcceptable: result.assessment === "适当",
    suggestions: result.suggestions,
  };
}

export function replyBottleTransaction(
  bottleId: string,
  blobId: string,
  txId: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: ReplyBottleMethod,
    arguments: [
      tx.object(bottleId),
      tx.pure.string(blobId),
      tx.pure.address(txId),
      tx.object("0x6"),
    ],
  });

  return tx;
}

export async function getBlob(id: string) {
  const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${id}`);

  return response.json();
}

async function getObjectFromTx(txId: string) {
  return txId;
}

export async function storeBlob(inputFile: File | string) {
  const response = await fetch(
    `${WALRUS_PUBLISHER_URL}/v1/store?epochs=${numEpochs}`,
    {
      method: "PUT",
      body: inputFile,
    }
  );

  if (response.status === 200) {
    // Parse successful responses as JSON, and return it along with the
    // mime type from the the file input element.
    const info = await response.json();

    console.log("info", info);
    if ("newlyCreated" in info) {
      return {
        blobId: info.newlyCreated.blobObject.blobId,
        objectId: info.newlyCreated.blobObject.id,
        media_type:
          typeof inputFile === "string" ? "text/plain" : inputFile.type,
      };
    } else if ("alreadyCertified" in info) {
      return {
        blobId: info.alreadyCertified.blobId,
        objectId: await getObjectFromTx(info.alreadyCertified.event.txDigest),
        media_type:
          typeof inputFile === "string" ? "text/plain" : inputFile.type,
      };
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  } else {
    throw new Error("Something went wrong when storing the blob!");
  }
}

export function useGetBlob(id: string) {
  return useQuery({
    queryKey: ["blob", id],
    queryFn: () => getBlob(id),
  });
}

export function useStoreBlob() {
  return useMutation({
    mutationFn: (inputFile: File | string) => storeBlob(inputFile),
  });
}
