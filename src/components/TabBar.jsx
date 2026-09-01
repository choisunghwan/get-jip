import Icon from "./Icon.jsx";

// 화면 어디서든 같은 자리, 같은 방식으로 이동하는 하단 고정 바.
export default function TabBar({ active, onHome, onList, onMap }) {
  const tabs = [
    { key: "home", label: "홈", icon: "home", onClick: onHome },
    { key: "list", label: "목록", icon: "list", onClick: onList },
    { key: "map", label: "지도", icon: "map", onClick: onMap },
  ];
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {tabs.map((t) => (
          <button key={t.key} className={`tabbar-btn${active === t.key ? " on" : ""}`} onClick={t.onClick}>
            <Icon name={t.icon} size={19} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
