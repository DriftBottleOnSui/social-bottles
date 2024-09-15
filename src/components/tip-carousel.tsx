import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tips = [
  `Is there something you've always wanted to say but never found the courage? What are you afraid of? What’s holding you back? Send a drift bottle and release the words that have been weighing on your heart.`,
  `Is there someone you can't stop thinking about, someone you long to speak to but don’t dare? Write your feelings in a drift bottle, and maybe it will find its way to them.`,
  `Has anyone ever told you, "I love you more than anything"?`,
  `Feeling overwhelmed? Need a place to let it all out? Write down the burdens on your heart and send them drifting away.`,
  `Did you know? That year, I waited for you… until the very end. `,
];

export default function TipCarousel() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000); // 每5秒切换一次提示

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tip-carousel text-sm text-gray-600 italic text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTip}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {tips[currentTip]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
