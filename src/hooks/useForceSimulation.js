import { useEffect, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
} from "d3-force";

// d3-force 로 노드 좌표를 계산해 React state 로 흘려보낸다.
// 렌더는 BrainGraph 가 SVG 로 직접 그린다(3단계 상태·값 배지·흔들림 제어를 위해).

export function useForceSimulation(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});
  const simRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const simNodes = nodes.map((n, i) => ({
      id: n.id,
      area: n.area,
      // 영역별로 초기 위치를 살짝 나눠 시작(수렴 빠르게 + 덜 엉킴)
      x: width / 2 + Math.cos((i / nodes.length) * Math.PI * 2) * 160 + (Math.random() - 0.5) * 40,
      y: height / 2 + Math.sin((i / nodes.length) * Math.PI * 2) * 160 + (Math.random() - 0.5) * 40,
    }));
    const idIndex = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks = edges.map((e) => ({
      source: e.from,
      target: e.to,
      cross: e.cross,
    }));

    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simLinks)
          .id((d) => d.id)
          .distance((l) => (l.cross ? 150 : 92))
          .strength((l) => (l.cross ? 0.15 : 0.32))
      )
      .force("charge", forceManyBody().strength(-340))
      .force("collide", forceCollide(44))
      .force("x", forceX(width / 2).strength(0.045))
      .force("y", forceY(height / 2).strength(0.06))
      .alpha(1)
      .alphaDecay(0.028);

    const flush = () => {
      const pos = {};
      for (const n of simNodes) pos[n.id] = { x: n.x, y: n.y };
      setPositions(pos);
    };
    sim.on("tick", flush);
    sim.on("end", flush);

    simRef.current = sim;
    nodesRef.current = simNodes;
    idIndex; // (참고: 드래그에서 사용)

    return () => sim.stop();
    // width/height 변경 시 재시작하지 않음(리사이즈로 그래프가 튀는 걸 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  /** 노드 드래그: 화면좌표 -> 월드좌표 변환 함수를 받아서 고정점(fx/fy) 설정 */
  const dragControls = {
    start(id) {
      const sim = simRef.current;
      if (!sim) return;
      sim.alphaTarget(0.25).restart();
    },
    move(id, worldX, worldY) {
      const n = nodesRef.current.find((n) => n.id === id);
      if (!n) return;
      n.fx = worldX;
      n.fy = worldY;
    },
    end(id) {
      const sim = simRef.current;
      const n = nodesRef.current.find((n) => n.id === id);
      if (n) {
        n.fx = null;
        n.fy = null;
      }
      if (sim) sim.alphaTarget(0);
    },
  };

  const reheat = () => {
    const sim = simRef.current;
    if (sim) sim.alpha(0.6).restart();
  };

  return { positions, dragControls, reheat };
}
