import { Transaction } from "@mysten/sui/transactions";

const CONTRACT_ADDRESS =
  "0xd0bb9f2fb93d5d750a859758b8c75fcb3416bfc71dc8684912de35cd030912b7";
// 0x791441ea7d717ed19d75b8edfc0f13256108cae4016c21e6dbf23e5d728a99dc mainnet
// 0xd0bb9f2fb93d5d750a859758b8c75fcb3416bfc71dc8684912de35cd030912b7 testnet
// 0x80386f5abfe2fc11cf1ba5ac0be8341c685ba5cac4fd5bfaf804b1f79f79d586 devnet
export const EventType = `${CONTRACT_ADDRESS}::social_bottle::BottleEvent`;
const CreateBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::createBottle`;
const ReplyBottleMethod = `${CONTRACT_ADDRESS}::social_bottle::openAndReplyBottle`;

export function createTransaction(
  toCreate: {
    blobId: string;
    objectId: string;
  }[],
  bottleId?: string,
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
