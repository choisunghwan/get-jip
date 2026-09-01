import { useRef, useState } from "react";
import { downloadSessionHtml, parseSessionFile } from "../lib/sessionFile.js";
import Icon from "./Icon.jsx";

// 진행 상황을 HTML 파일로 저장 / 그 파일을 올려 복원.
// mode: "both" | "save" | "load"
export default function SessionFile({ state, onLoad, mode = "both", compact }) {
  const inputRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const parsed = parseSessionFile(text);
    if (!parsed) {
      setMsg("이 파일에서 진행 정보를 못 찾았어요. 집짓기에서 저장한 파일인지 확인해주세요.");
      return;
    }
    onLoad(parsed);
  };

  return (
    <div className={`sessfile${compact ? " compact" : ""}`}>
      {(mode === "both" || mode === "save") && (
        <button className="btn ghost" onClick={() => downloadSessionHtml(state)}>
          <Icon name="scroll" size={13} /> 진행 파일 저장
        </button>
      )}
      {(mode === "both" || mode === "load") && (
        <button className="btn ghost" onClick={pick}>
          <Icon name="pin" size={13} /> 진행 파일 불러오기
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".html,text/html,application/json,.json"
        hidden
        onChange={onFile}
      />
      {msg && <p className="sessfile-msg">{msg}</p>}
    </div>
  );
}
