import { useEffect } from "react";
import { motion } from "framer-motion";
import Icon from "./Icon.jsx";

export default function LevelUpBanner({ level, onAck }) {
  useEffect(() => {
    const t = setTimeout(onAck, 4000);
    return () => clearTimeout(t);
  }, [level.lv, onAck]);

  return (
    <motion.button
      className="levelup"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={onAck}
    >
      <Icon name={level.icon} size={24} className="lu-emoji" />
      <span>
        <b>레벨 업! LV {level.lv}</b>
        <span className="lu-title">{level.title}</span>
      </span>
    </motion.button>
  );
}
