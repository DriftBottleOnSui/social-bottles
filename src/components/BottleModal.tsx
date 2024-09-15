import React, { useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@nextui-org/react";

import { Bottle } from "@/types";
import { useSubmission } from "@/hooks/use-submission";

interface BottleModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedBottle: Bottle | null;
}

function getFromId(bottle: Bottle) {
  const fromId = bottle.from;

  return `${fromId.slice(0, 4)}...${fromId.slice(-4)}`;
}

export default function BottleModal({
  isOpen,
  onOpenChange,
  selectedBottle,
}: BottleModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    content: replyMessage,
    setContent: setReplyMessage,
    image: replyImage,
    setImage: setReplyImage,
    aiSuggestion,
    isChecking,
    isPending,
    handleSubmit,
  } = useSubmission(selectedBottle!.id);

  const handleReply = () => {
    handleSubmit();
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

  return (
    <Modal
      classNames={{
        base: "max-w-[1000px] w-full",
      }}
      isOpen={isOpen}
      size="5xl"
      onOpenChange={onOpenChange}
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
                        <Image
                          alt="Message content"
                          className="w-full h-auto"
                          src={msg.content}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 space-y-2">
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your reply..."
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                {aiSuggestion && (
                  <p className="text-red-500 text-sm mt-1">{aiSuggestion}</p>
                )}
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
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="bg-gray-500 text-white hover:bg-gray-600 w-auto mx-auto mt-3 rounded-full 
                transition-all duration-300 hover:shadow-xl hover:scale-105"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                className="bg-[#fb0c0c] text-white hover:bg-[#d80a0a] w-auto mx-auto mt-3 rounded-full 
                transition-all duration-300 hover:shadow-xl hover:scale-105"
                isLoading={isPending || isChecking}
                onPress={handleReply}
              >
                {isPending ? "Sending..." : "Send Reply"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
