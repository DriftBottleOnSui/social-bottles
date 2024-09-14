import { Transaction } from "@mysten/sui/transactions";
import siteConfig from "./config";
import BottleImageType1 from "/images/bottles/1.png";
import BottleImageType2 from "/images/bottles/2.png";
import BottleImageType3 from "/images/bottles/3.png";
import { Bottle } from "./types";

const WALRUS_PUBLISHER_URL = siteConfig.WALRUS_PUBLISHER_URL;
const WALRUS_AGGREGATOR_URL = siteConfig.WALRUS_AGGREGATOR_URL;
const numEpochs = 1;

const CONTRACT_ADDRESS =
  "0xf9e1810f194bf23b229638d87f5323ec045d20e8d2bd7d3383381f6970e17cb2";

export const EventType = `${CONTRACT_ADDRESS}::social_bottle::BottleEvent`;
const CreateBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::createBottle`;
const ReplyBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::openAndReplyBottle`;

export function getBottleImage(bottle: Bottle) {
  const bottleImg = bottle.msgs.find((msg) => msg.mediaType === "image");
  if (bottleImg) {
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

export function createBottleTransaction(
  toCreate: {
    blobId: string;
    objectId: string;
  }[]
) {
  const tx = new Transaction();
  const blobIds = toCreate.map((item) => item.blobId);
  const objIds = toCreate.map((item) => item.objectId);
  tx.moveCall({
    target: CreateBottleMethod,
    arguments: [
      // @ts-expect-error We know this is the correct type for the Sui SDK
      tx.pure("vector<string>", blobIds),
      // @ts-expect-error We know this is the correct type for the Sui SDK
      tx.pure("vector<address>", objIds),
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

// 使用sessionStorage缓存函数结果, 使用装饰器实现, key 自动生成
function cacheWithSessionStorageDecorator<
  T extends (...args: any[]) => Promise<any>,
>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    const key = `${fn.name}-${JSON.stringify(args)}`;
    const cachedValue = sessionStorage.getItem(key);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    try {
      const value = await fn(...args);
      if (value !== null && value !== undefined) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
      return value;
    } catch (error) {
      console.error("请求失败，不缓存结果:", error);
      throw error;
    }
  }) as T;
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

async function getObjectFromTx(txId: string) {
  return txId;

  // const rst = await client.getTransactionBlock({
  //   digest: "DY1bNRbXwxVVReuVDQBvTwuT9EYnV6En7iqJZveJq9As",
  //   options: {
  //     showInput: true,
  //   },
  // });

  // const inputs = rst.transaction.data.transaction.inputs;
  // const { objectId } = inputs.find(
  //   ({ type, objectType }) =>
  //     type === "object" && objectType === "immOrOwnedObject"
  // );
  // console.log(objectId);
}

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
