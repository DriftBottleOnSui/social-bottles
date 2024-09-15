import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ADDRESS =
  "0xf9e1810f194bf23b229638d87f5323ec045d20e8d2bd7d3383381f6970e17cb2";

export const EventType = `${CONTRACT_ADDRESS}::social_bottle::BottleEvent`;
const CreateBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::createBottle`;
const ReplyBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::openAndReplyBottle`;

export function createBottleTransaction(
  toCreate: {
    blobId: string;
    objectId: string;
  }[],
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

export function replyBottleTransaction(
  bottleId: string,
  blobId: string,
  txId: string,
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
