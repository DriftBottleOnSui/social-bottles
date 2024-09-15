import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ADDRESS =
  "0xf9e1810f194bf23b229638d87f5323ec045d20e8d2bd7d3383381f6970e17cb2";

export const EventType = `${CONTRACT_ADDRESS}::social_bottle::BottleEvent`;
const CreateBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::createBottle`;
const ReplyBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::openAndReplyBottle`;

export function createTransaction(
  toCreate: {
    blobId: string;
    objectId: string;
  }[],
  bottleId?: string
) {
  const tx = new Transaction();
  const blobIds = toCreate.map((item) => item.blobId);
  const objIds = toCreate.map((item) => item.objectId);
  const method = bottleId ? ReplyBottleMethod : CreateBottleMethod;
  const args = bottleId ? [tx.object(bottleId)] : [];
  // @ts-expect-error We know this is the correct type for the Sui SDK
  args.push(tx.pure("vector<string>", blobIds));
  // @ts-expect-error We know this is the correct type for the Sui SDK
  args.push(tx.pure("vector<address>", objIds));
  args.push(tx.object("0x6"));

  tx.moveCall({
    target: method,
    arguments: args,
  });

  return tx;
}
