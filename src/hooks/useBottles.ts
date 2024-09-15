import { useState, useEffect } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import dayjs from "dayjs";
import { EventType } from "@/utils/transaction";
import { BottleIdObj, Bottle } from "@/types";
import { getBlobWithCache } from "@/utils/storage";

async function toBottle(obj: any): Promise<Bottle> {
  const msgIds = obj.data.content.fields.msgs.map(
    (msg: any) => msg.fields.blob_id
  );
  const promises = msgIds.map((id: string) => getBlobWithCache(id));
  const blobs = await Promise.all(promises);
  const displayMsg =
    blobs.find((blob) => blob.mediaType === "text")?.content || "";

  const timestamp = parseInt(obj.data.content.fields.from_time) * 1000;
  const createAt = dayjs(timestamp).format("MMM D, YYYY h:mm A");

  return {
    id: obj.data.objectId,
    from: obj.data.content.fields.from,
    to: obj.data.content.fields.to,
    displayMsg: displayMsg,
    createAt: createAt,
    msgs: blobs.map((blob: any) => ({
      content: blob.content,
      mediaType: blob.mediaType,
    })),
  };
}

export function useBottles() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [sentBottles, setSentBottles] = useState(0);
  const [repliedBottles, setRepliedBottles] = useState(0);

  const fetchBottles = async () => {
    const result = (await suiClient.queryEvents({
      query: {
        MoveEventType: EventType,
      },
      limit: 1000,
    })) as {
      data: BottleIdObj[];
    };

    const ids = new Set(result.data.map((obj) => obj.parsedJson.bottle_id));

    const objs = await suiClient.multiGetObjects({
      ids: Array.from(ids),
      options: {
        showPreviousTransaction: true,
        showContent: true,
      },
    });

    const fetchedBottles = await Promise.all(objs.map((obj) => toBottle(obj)));

    setBottles(fetchedBottles);

    const sentCount = result.data.filter(
      (obj) =>
        obj.parsedJson.action_type === "create" &&
        obj.parsedJson.from === currentAccount?.address
    ).length;
    const repliedCount = result.data.filter(
      (obj) =>
        obj.parsedJson.action_type === "reply" &&
        obj.parsedJson.to === currentAccount?.address
    ).length;

    setSentBottles(sentCount);
    setRepliedBottles(repliedCount);
  };

  useEffect(() => {
    fetchBottles();
  }, [currentAccount, suiClient]);

  const refresh = () => {
    setTimeout(() => {
      fetchBottles();
    }, 1000);
  };

  return { bottles, sentBottles, repliedBottles, refresh };
}
