import { useState } from "react";
import Icon from "./Icon.jsx";

const SHARE_URL = "https://get-jip.ttubeogi.workers.dev";
const SHARE_TITLE = "집짓기 — 내 집 마련 가이드";
const SHARE_TEXT = "내 집 마련, 뭐부터 해야 할지 STEP별로 알려주는 무료 도구야. 같이 해보자!";

// 모바일에선 OS 공유 시트(카톡 포함), 아니면 링크 복사.
export default function ShareButton({ className = "btn", label = "친구에게 공유", size = 14 }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL });
      } catch {
        /* 사용자가 취소 — 무시 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("이 링크를 복사해서 친구에게 보내세요", SHARE_URL);
    }
  };

  return (
    <button className={className} onClick={onShare}>
      <Icon name="share" size={size} /> {copied ? "링크 복사됨!" : label}
    </button>
  );
}
