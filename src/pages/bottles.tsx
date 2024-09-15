import { useEffect, useState } from "react";
import { Skeleton, Button, useDisclosure } from "@nextui-org/react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

import DefaultLayout from "@/layouts/default";
import { getBottleImage } from "@/utils/storage";
import { Bottle } from "@/types";
import BottleModal from "@/components/BottleModal";
import MintForm from "@/components/mint-form";
import { useBottles } from "@/hooks/useBottles";

function getFromId(bottle: Bottle) {
  const fromId = bottle.from;

  return `${fromId.slice(0, 4)}...${fromId.slice(-4)}`;
}

export default function BottlesPage() {
  const currentAccount = useCurrentAccount();

  const [activeTab, setActiveTab] = useState("unread");
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);

  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleReply = (message: string, image: File | null) => {
    console.log("Reply message:", message);
    console.log("Reply image:", image);
    // Add reply logic here
  };

  const { bottles, sentBottles, repliedBottles } = useBottles();

  useEffect(() => {
    // 根据activeTab过滤瓶子
    if (activeTab === "unread") {
      setFilteredBottles(bottles.filter((bottle) => !bottle.to));
    } else if (activeTab === "bottles") {
      setFilteredBottles(
        bottles.filter((bottle) => bottle.from === currentAccount?.address)
      );
    } else if (activeTab === "friends") {
      setFilteredBottles(
        bottles.filter((bottle) => bottle.to === currentAccount?.address)
      );
    }
  }, [activeTab, bottles, currentAccount]);

  const handleOpenBottle = (bottle: Bottle) => {
    setSelectedBottle(bottle);
    onOpen();
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full">
        {/* 左侧导航栏 */}
        <div className="w-80 min-w-80 p-6 bg-gray-900 text-white">
          <img
            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${currentAccount?.address || "default"}`}
            alt="Wallet Avatar"
            className="w-32 h-32 mx-auto rounded-full border-4 border-white mb-6"
          />
          <div className="mb-6 text-center">
            <p className="text-sm">Bottles: {sentBottles}</p>
            <p className="text-sm">Friends: {repliedBottles}</p>
          </div>
          <div className="flex flex-col space-y-3">
            {[
              { key: "unread", label: "New Bottles" },
              { key: "bottles", label: "My Bottles" },
              { key: "friends", label: "Friends' Bottles" },
              { key: "drop", label: "Drop a Bottle" },
            ].map((item) => (
              <button
                key={item.key}
                className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 ${
                  activeTab === item.key
                    ? "bg-white text-gray-900 font-semibold"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div
          className="flex-grow p-4 bg-cover bg-center bg-no-repeat "
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)), url('/images/bottles-bg.png')",
          }}
        >
          {(activeTab === "bottles" || activeTab === "friends") &&
            !currentAccount?.address && (
              <div className="flex justify-center items-center h-full">
                <ConnectButton />
              </div>
            )}
          {(activeTab === "unread" || currentAccount?.address) && (
            <div className="show-all-bottles flex flex-wrap gap-4">
              {filteredBottles.length === 0
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
                  filteredBottles.map((bottle) => (
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
