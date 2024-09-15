import { cacheWithSessionStorageDecorator } from "./index";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import siteConfig from "@/config";

const suiNetwork = siteConfig.SUI_NETWORK as
  | "testnet"
  | "mainnet"
  | "devnet"
  | "localnet";
const WALRUS_PUBLISHER_URL = siteConfig.WALRUS_PUBLISHER_URL;
const WALRUS_AGGREGATOR_URL = siteConfig.WALRUS_AGGREGATOR_URL;
const numEpochs = 1;

import BottleImageType1 from "/images/bottles/1.png";
import BottleImageType2 from "/images/bottles/2.png";
import BottleImageType3 from "/images/bottles/3.png";

import { Bottle } from "@/types";

export function getBottleImage(bottle: Bottle, isUnread = false) {
  const bottleImg = bottle.msgs.find((msg) => msg.mediaType === "image");

  if (!isUnread && bottleImg) {
    return bottleImg.content;
  }
  const idNum = parseInt(bottle.id.slice(2), 16) % 3;

  switch (idNum) {
    case 0:
      return BottleImageType1;
    case 1:
      return BottleImageType2;
    case 2:
      return BottleImageType3;
  }
}

export async function getBlob(id: string) {
  const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${id}`, {
    headers: {
      Range: "bytes=0-255", // 请求前256字节，足够覆盖所有可能的文本内容
    },
  });

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const header = new Uint8Array(buffer);

    // 检查文件头部特征
    const isImage =
      (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) || // JPEG
      (header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47) || // PNG
      (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46); // GIF

    if (isImage) {
      // 如果是图片，返回完整的URL
      return {
        content: `${WALRUS_AGGREGATOR_URL}/v1/${id}`,
        mediaType: "image",
      };
    } else {
      // 如果不是图片，假设是文本，直接解码并返回内容
      const decoder = new TextDecoder();

      return {
        content: decoder.decode(buffer),
        mediaType: "text",
      };
    }
  }

  return null;
}

export const getBlobWithCache = cacheWithSessionStorageDecorator(getBlob);

export async function storeBlob(inputFiles: (File | string)[]) {
  const promises = inputFiles.map((inputFile) => {
    return fetch(`${WALRUS_PUBLISHER_URL}/v1/store?epochs=${numEpochs}`, {
      method: "PUT",
      body: inputFile,
    });
  });

  try {
    const results = await Promise.all(promises);
    const returnData = [];

    for (const response of results) {
      if (response.status === 200) {
        // Parse successful responses as JSON, and return it along with the
        // mime type from the the file input element.
        const info = await response.json();

        console.log("info", info);
        if ("newlyCreated" in info) {
          returnData.push({
            blobId: info.newlyCreated.blobObject.blobId,
            objectId: info.newlyCreated.blobObject.id,
          });
        } else if ("alreadyCertified" in info) {
          returnData.push({
            blobId: info.alreadyCertified.blobId,
            objectId: await getObjectFromTx(
              info.alreadyCertified.event.txDigest
            ),
          });
        } else {
          throw new Error("Something went wrong when storing the blob!");
        }
      }
    }

    return returnData;
  } catch (error) {
    console.error("Error storing blobs:", error);
    throw error;
  }
}

async function getObjectFromTx(txId: string) {
  const suiClient = new SuiClient({
    url: getFullnodeUrl(suiNetwork),
  });

  const rst = await suiClient.getTransactionBlock({
    digest: txId,
    options: {
      showInput: true,
    },
  });

  if (!rst.transaction) {
    throw new Error("Transaction data not found");
  }
  // @ts-expect-error We know this is the correct type for the Sui SDK
  const inputs = rst.transaction.data.transaction.inputs;
  const { objectId } = inputs.find(
    // @ts-expect-error We know this is the correct type for the Sui SDK
    ({ type, objectType }) =>
      type === "object" && objectType === "immOrOwnedObject"
  );

  return objectId;
}

getObjectFromTx("8qkLrSW2M16zZdmPtppJNwHLPGNW2w6RuhoFsMbLQqvC");
