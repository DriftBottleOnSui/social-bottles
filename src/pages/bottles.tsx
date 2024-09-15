import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useSuiClient } from "@mysten/dapp-kit";
import { Skeleton, Button, useDisclosure } from "@nextui-org/react";

import DefaultLayout from "@/layouts/default";
import { getBottleImage, getBlobWithCache } from "@/utils/storage";
import { EventType } from "@/utils/transaction";
import { BottleIdObj, Bottle } from "@/types";
import BottleModal from "@/components/BottleModal";
import MintForm from "@/components/mint-form";

function getFromId(bottle: Bottle) {
  const fromId = bottle.from;

  return `${fromId.slice(0, 4)}...${fromId.slice(-4)}`;
}

async function toBottle(obj: any): Promise<Bottle> {
  const msgIds = obj.data.content.fields.msgs.map(
    (msg: any) => msg.fields.blob_id
  );
  const promises = msgIds.map((id: string) => getBlobWithCache(id));
  const blobs = await Promise.all(promises);
  const displayMsg =
    blobs.find((blob) => blob.mediaType === "text")?.content || "";

  // Convert timestamp to milliseconds
  const timestamp = parseInt(obj.data.content.fields.from_time) * 1000;
  const createAt = dayjs(timestamp).format("MMM D, YYYY h:mm A");

  return {
    id: obj.data.objectId,
    from: obj.data.content.fields.from,
    displayMsg: displayMsg,
    createAt: createAt,
    msgs: blobs.map((blob: any) => ({
      content: blob.content,
      mediaType: blob.mediaType,
    })),
  };
}

export default function BottlesPage() {
  const suiClient = useSuiClient();
  const [activeTab, setActiveTab] = useState("all");
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleReply = (message: string, image: File | null) => {
    console.log("Reply message:", message);
    console.log("Reply image:", image);
    // Add reply logic here
  };

  useEffect(() => {
    const fetchBottles = async () => {
      // Get all bottle objectIds
      const result = (await suiClient.queryEvents({
        query: {
          MoveEventType: EventType,
        },
        limit: 1000,
      })) as {
        data: BottleIdObj[];
      };

      const repliedIds = result.data
        .filter((obj) => obj.parsedJson.action_type === "reply")
        .map((obj) => obj.parsedJson.bottle_id);

      const ids = result.data
        .filter(
          (obj) =>
            obj.parsedJson.action_type === "create" &&
            !repliedIds.includes(obj.parsedJson.bottle_id)
        )
        .map((obj) => obj.parsedJson.bottle_id);

      // Get bottle data
      const objs = await suiClient.multiGetObjects({
        ids: ids,
        options: {
          showPreviousTransaction: true,
          showContent: true,
        },
      });

      console.log(objs);
      const bottles = await Promise.all(objs.map((obj) => toBottle(obj)));

      console.log("bottles", bottles);

      setBottles(bottles);
    };

    fetchBottles();
  }, []);

  const handleOpenBottle = (bottle: Bottle) => {
    setSelectedBottle(bottle);
    onOpen();
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full">
        {/* Left sidebar */}
        <div className="basis-80 p-4 bg-black text-white">
          <div className="flex flex-col space-y-4">
            <button
              className={`w-full p-2 border ${
                activeTab === "all"
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-white"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Show All Bottles
            </button>
            <button
              className={`w-full p-2 border ${
                activeTab === "drop"
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-white"
              }`}
              onClick={() => setActiveTab("drop")}
            >
              Drop a Bottle
            </button>
          </div>
        </div>

        {/* Right content area */}
        <div
          className="flex-grow p-4 bg-cover bg-center bg-no-repeat "
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)), url('/images/bottles-bg.png')",
          }}
        >
          {activeTab === "all" && (
            <div className="show-all-bottles flex flex-wrap gap-4">
              {bottles.length === 0
                ? // Show skeleton screen
                  Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="w-64 h-80 bg-white rounded-lg p-4"
                      >
                        <Skeleton className="rounded-lg">
                          <div className="h-32 rounded-lg bg-default-300" />
                        </Skeleton>
                        <div className="space-y-3 mt-4">
                          <Skeleton className="w-3/5 rounded-lg">
                            <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                          </Skeleton>
                          <Skeleton className="w-4/5 rounded-lg">
                            <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                          </Skeleton>
                          <Skeleton className="w-2/5 rounded-lg">
                            <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                          </Skeleton>
                        </div>
                      </div>
                    ))
                : // Show actual bottle data
                  bottles.map((bottle) => (
                    <div
                      key={bottle.id}
                      className="p-4 border rounded-lg shadow-lg w-64 h-80 overflow-hidden bg-white text-black flex flex-col 
                      justify-between "
                    >
                      <div className="flex-grow flex items-center justify-center">
                        <img
                          alt="Bottle"
                          className="h-36 w-auto object-contain"
                          src={getBottleImage(bottle)}
                        />
                      </div>
                      <div className="space-y-2">
                        {bottle.displayMsg.length > 0 && (
                          <p className="text-sm text-center font-medium truncate">
                            {bottle.displayMsg}
                          </p>
                        )}
                        <p className="text-xs text-center text-gray-600">
                          From: {getFromId(bottle)}
                        </p>
                      </div>
                      <Button
                        className="bg-[#fb0c0c] text-white hover:bg-[#d80a0a] w-auto mx-auto mt-3 rounded-full 
                        transition-all duration-300 hover:shadow-xl hover:scale-105
                        "
                        size="sm"
                        onClick={() => handleOpenBottle(bottle)}
                      >
                        Open Bottle
                      </Button>
                    </div>
                  ))}
            </div>
          )}
          {activeTab === "drop" && (
            <div className="flex justify-center items-center h-full">
              <MintForm />
            </div>
          )}
        </div>
      </div>

      {selectedBottle && (
        <BottleModal
          isOpen={isOpen}
          selectedBottle={selectedBottle}
          onOpenChange={onOpenChange}
          onReply={handleReply}
        />
      )}
    </DefaultLayout>
  );
}
