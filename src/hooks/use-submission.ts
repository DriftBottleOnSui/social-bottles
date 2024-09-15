import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import toast from "react-hot-toast";
import { checkTextWithAI } from "@/utils";
import { storeBlob } from "@/utils/storage";
import { createTransaction } from "@/utils/transaction";

export function useSubmission(objectId?: string) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const { mutate: storeObject, isPending } = useMutation({
    mutationFn: (input: (File | string)[]) => storeBlob(input),
    onSuccess: (data) => {
      console.log("Storage successful:", data);
      const tx = createTransaction(data, objectId);

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onError: (err: Error) => {
            console.error(err.message);
            toast.error(err.message);
          },
          onSuccess: (result) => {
            console.log("Transaction successful, digest:", result.digest);
            toast.success("Operation completed successfully");
            setContent("");
            setImage(null);
          },
        }
      );
    },
    onError: (error) => {
      console.log("Error", error);
      toast.error(error.message);
    },
  });

  const handleSubmit = async () => {
    if (isPending) return;

    const toStore = [];

    if (content) {
      try {
        setIsChecking(true);
        const checkResult = await checkTextWithAI(content);

        if (!checkResult.isAcceptable) {
          setAiSuggestion(checkResult.suggestions);
          toast.error(
            "Text content is inappropriate. Please review the suggestions and modify."
          );
          return;
        }
      } catch (error) {
        console.error("AI check failed:", error);
      } finally {
        setIsChecking(false);
      }
      toStore.push(content);
    }

    if (image) {
      if (image.type !== "image/jpeg" && image.type !== "image/png") {
        toast.error("Please upload a JPG or PNG image");
        return;
      }
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB");
        return;
      }
      toStore.push(image);
    }

    if (toStore.length === 0) {
      toast.error("Please enter text or upload an image");
      return;
    }

    storeObject(toStore);
  };

  return {
    content,
    setContent,
    image,
    setImage,
    aiSuggestion,
    isChecking,
    isPending,
    handleSubmit,
  };
}
