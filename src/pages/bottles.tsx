import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { useSuiClient } from "@mysten/dapp-kit";
import { EventType, getBottleImage, getBlobWithCache } from "@/utils";
import { BottleIdObj, Bottle } from "@/types";
import { Skeleton } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

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
  return {
    id: obj.data.objectId,
    from: obj.data.content.fields.from,
    displayMsg: displayMsg,
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

  useEffect(() => {
    const fetchBottles = async () => {
      // 获取所有瓶子的objectId
      const result = (await suiClient.queryEvents({
        query: {
          MoveEventType: EventType,
        },
        limit: 1000,
      })) as {
        data: BottleIdObj[];
      };

      console.log("result", result);

      const ids = result.data
        .filter((obj) => obj.parsedJson.action_type === "create")
        .map((obj) => obj.parsedJson.bottle_id);

      // 获取瓶子的数据
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

  return (
    <DefaultLayout>
      <div className="flex h-full w-full">
        {/* 左侧栏 */}
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

        {/* 右侧内容区 */}
        <div
          className="flex-grow p-4 bg-cover bg-center bg-no-repeat text-white"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/bottles-bg.png')",
          }}
        >
          {activeTab === "all" && (
            <div className="show-all-bottles flex flex-wrap gap-4">
              {bottles.length === 0
                ? // 显示骨架屏
                  Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="w-64 h-80 bg-white rounded-lg p-4"
                      >
                        <Skeleton className="rounded-lg">
                          <div className="h-32 rounded-lg bg-default-300"></div>
                        </Skeleton>
                        <div className="space-y-3 mt-4">
                          <Skeleton className="w-3/5 rounded-lg">
                            <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                          </Skeleton>
                          <Skeleton className="w-4/5 rounded-lg">
                            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                          </Skeleton>
                          <Skeleton className="w-2/5 rounded-lg">
                            <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                          </Skeleton>
                        </div>
                      </div>
                    ))
                : // 显示实际的瓶子数据
                  bottles.map((bottle) => (
                    <div
                      key={bottle.id}
                      className="p-4 border rounded-lg shadow-lg w-64 h-80 overflow-hidden bg-white text-black flex flex-col 
                      justify-between transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <div className="flex-grow flex items-center justify-center">
                        <img
                          src={getBottleImage(bottle)}
                          alt="瓶子"
                          className="h-36 w-auto object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        {bottle.displayMsg.length > 0 && (
                          <p className="text-sm text-center font-medium line-clamp-2">
                            {bottle.displayMsg}
                          </p>
                        )}
                        <p className="text-xs text-center text-gray-600">
                          From: {getFromId(bottle)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#fb0c0c] text-white hover:bg-[#d80a0a] w-auto mx-auto mt-3 rounded-full transition-colors duration-300"
                        onClick={() => {
                          console.log("click");
                        }}
                      >
                        Open Bottle
                      </Button>
                    </div>
                  ))}
            </div>
          )}
          {activeTab === "drop" && (
            <div>
              <h2 className="text-3xl font-extrabold mb-6 text-shadow">
                投放一个瓶子
              </h2>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="输入你的消息"
                  className="p-2 border rounded-md"
                />
                <button className="p-2 bg-blue-500 text-white rounded-md">
                  投放瓶子
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
