import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  Skeleton,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

import DefaultLayout from "@/layouts/default";
import { EventType, getBottleImage, getBlobWithCache } from "@/utils";
import { BottleIdObj, Bottle } from "@/types";

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
  const [replyMessage, setReplyMessage] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReply = () => {
    // Add reply logic here
    console.log("Reply message:", replyMessage);
    console.log("Reply image:", replyImage);
    // Clear input after sending reply
    setReplyMessage("");
    setReplyImage(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReplyImage(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

      console.log("result", result);

      const ids = result.data
        .filter((obj) => obj.parsedJson.action_type === "create")
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
          className="flex-grow p-4 bg-cover bg-center bg-no-repeat text-white"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/bottles-bg.png')",
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
            <div>
              <h2 className="text-3xl font-extrabold mb-6 text-shadow">
                Drop a Bottle
              </h2>
              <div className="flex flex-col space-y-4">
                <input
                  className="p-2 border rounded-md"
                  placeholder="Enter your message"
                  type="text"
                />
                <button className="p-2 bg-blue-500 text-white rounded-md">
                  Drop Bottle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottle content dialog */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl" // 更改为更大的预定义尺寸
        classNames={{
          base: "max-w-[1000px] w-full", // 添加自定义类名来控制最大宽度
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedBottle && `From: ${getFromId(selectedBottle)}`}
              </ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                {selectedBottle && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Created at: {selectedBottle.createAt}
                    </p>
                    {selectedBottle.msgs.map((msg, index) => (
                      <div
                        key={index}
                        className="border-t pt-2 first:border-t-0 first:pt-0"
                      >
                        {msg.mediaType === "text" ? (
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        ) : (
                          <img
                            src={msg.content}
                            alt="Message image"
                            className="w-full h-auto"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Add reply form */}
                <div className="mt-4 space-y-2">
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Enter your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      className="bg-gray-200 text-gray-800"
                      onClick={triggerFileInput}
                    >
                      Upload Image
                    </Button>
                    {replyImage && (
                      <span className="text-sm text-gray-600">
                        {replyImage.name}
                      </span>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="bg-[#fb0c0c] text-white hover:bg-[#d80a0a] w-auto mx-auto mt-3 rounded-full 
                transition-all duration-300 hover:shadow-xl hover:scale-105
                "
                  onPress={handleReply}
                >
                  Send Reply
                </Button>
                <Button
                  className="bg-gray-500 text-white hover:bg-gray-600 w-auto mx-auto mt-3 rounded-full 
                  transition-all duration-300 hover:shadow-xl hover:scale-105
                  "
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}
