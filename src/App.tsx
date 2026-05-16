import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

{
  /* 컴포넌트 import 추가 */
}
import DetailView from "./components/DetailView";
import WeatherWidget from "./components/WeatherWidget";
import MusicWidget from "./components/MusicWidget";
import StockWidget from "./components/StockWidget";
import NewsWidget from "./components/NewsWidget";
import ClockWidget from "./components/ClockWidget";

type ModuleType = "news" | "music" | "weather" | "stock" | "clock";
interface UserProfile {
  name: string;
  email?: string;
  location?: {
    city?: string;
    lat?: number;
    lon?: number;
  };
}

interface MirrorSlot {
  type?: string | null;
  stockName?: string | null;
  symbol?: string | null;
}

interface MirrorSettings {
  layout: number;
  slots: {
    "1"?: MirrorSlot;
    "2"?: MirrorSlot;
    "3"?: MirrorSlot;
    "4"?: MirrorSlot;
  };
}

const DEFAULT_SETTINGS: MirrorSettings = {
  layout: 1,
  slots: {
    "1": { type: "news" },
    "2": { type: "music" },
    "3": { type: "weather" },
    "4": { type: "stock" },
  },
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "none",
  background: "#f39c12",
  color: "white",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};


// =====================================================================
// 1. 로그인 뷰 (STT Wake Word + 자동 절전 모드 적용)
// =====================================================================
const LoginView: React.FC<{ onFaceLogin: (uid: string) => void }> = ({
  onFaceLogin,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null); // 자동 절전 타이머

  const [isAwake, setIsAwake] = useState(false);
  const [status, setStatus] = useState("시스템 대기 중...");
  const [loggingIn, setLoggingIn] = useState(false);

  // 로컬 루프백 주소 유지 (가장 안정적임)
  const serverUrl = "http://127.0.0.1:8000/face-login";
  const wsUrl = "ws://127.0.0.1:8000/ws";

  // 💤 30초 후 다시 화면을 끄는 함수
  const resetSleepTimer = () => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => {
      console.log("💤 30초 경과: 다시 절전 모드로 진입합니다.");
      setIsAwake(false);
      setStatus("시스템 대기 중...");
    }, 30000);
  };

  const handleFaceLogin = async () => {
    if (!videoRef.current || !canvasRef.current || loggingIn) return;

    try {
      setLoggingIn(true);
      setStatus("얼굴 분석 중...");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStatus("캡처 실패");
        setLoggingIn(false);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setStatus("이미지 생성 실패");
            setLoggingIn(false);
            return;
          }

          try {
            const formData = new FormData();
            formData.append("file", blob, "face.jpg");

            const res = await fetch(serverUrl, {
              method: "POST",
              body: formData,
            });
            const data = await res.json();

            if (data.success) {
              setStatus(`인증 성공: ${data.name ?? "사용자"}님`);
              if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
              onFaceLogin(data.user_id);
            } else {
              setStatus(data.message ?? "등록되지 않은 사용자입니다.");
              setLoggingIn(false);
              resetSleepTimer(); // 실패하면 타이머 리셋 후 대기
            }
          } catch {
            setStatus("서버 연결 실패");
            setLoggingIn(false);
            resetSleepTimer();
          }
        },
        "image/jpeg",
        0.9,
      );
    } catch {
      setStatus("오류 발생");
      setLoggingIn(false);
      resetSleepTimer();
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }

      // 웹소켓 연결 (음성 신호 수신)
      if (
        !socketRef.current ||
        socketRef.current.readyState === WebSocket.CLOSED
      ) {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => console.log("✅ WebSocket Connected");

        socket.onmessage = (event) => {
          const cleanData = String(event.data).replace(/"/g, "").trim();

          if (cleanData === "WAKE_UP") {
            console.log("💡 [STT] 기상 신호 수신: 화면을 켭니다.");
            setIsAwake(true);
            setStatus('"인식"이라고 말씀하세요.');
            resetSleepTimer();
          } else if (cleanData === "TAKE_PHOTO") {
            console.log("📸 [STT] 촬영 신호 수신: 인증을 시작합니다.");
            setIsAwake(true); // 혹시 꺼져있어도 바로 켜면서 촬영
            handleFaceLogin();
          }
        };

        socket.onclose = () => console.log("⚠️ WebSocket 연결 끊김");
        socket.onerror = (err) => console.error("❌ WebSocket Error:", err);
      }
    };

    init();

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (socketRef.current) socketRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="mirror-container center-layout"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 절전 모드 장막 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          zIndex: 20,
          opacity: isAwake ? 0 : 1,
          pointerEvents: isAwake ? "none" : "auto",
          transition: "opacity 0.8s ease-in-out",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "24px" }}>
          Zzz...
        </span>
      </div>

      {/* 거울 메인 UI */}
      <div
        className="scan-content"
        style={{
          position: "relative",
          zIndex: 10,
          width: "520px",
          background: "rgba(255,255,255,0.06)",
          padding: "32px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>🪞</div>
        <h1 style={{ marginBottom: "16px" }}>스마트 미러 인식</h1>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            borderRadius: "20px",
            background: "#111",
            marginBottom: "18px",
          }}
        />

        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(243, 156, 18, 0.2)",
            border: "1px solid #f39c12",
            color: "#f39c12",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {status}
        </div>
      </div>
    </div>
  );
};

const PlaceholderWidget: React.FC<{ title: string }> = ({ title }) => (
  <div className="widget">
    <div className="widget-header">
      <span style={{ fontSize: "24px" }}>✨</span>
      <h3>{title}</h3>
    </div>
    <p style={{ color: "#aaa" }}>준비 중입니다.</p>
  </div>
);

function normalizeModuleType(type?: string | null): ModuleType | null {
  if (!type) return null;

  if (type === "news" || type === "뉴스") return "news";
  if (type === "weather" || type === "날씨") return "weather";
  if (type === "music" || type === "음악") return "music";
  if (type === "stock" || type === "주식") return "stock";

  return null;
}

function renderSlotModule(
  slot: MirrorSlot | undefined,
  user: UserProfile | null,
): React.ReactNode {
  const type = slot?.type;

  if (!type) return null;

  if (type === "stock" || type === "주식") {
    return <StockWidget />;
  }

  if (type === "weather" || type === "날씨") {
    return <WeatherWidget />;
  }

  if (type === "music" || type === "음악") {
    return <MusicWidget />;
  }

  if (type === "news" || type === "뉴스") {
    return <NewsWidget />;
  }

  if (type === "schedule" || type === "일정") {
    return <PlaceholderWidget title="일정" />;
  }

  return null;
}

export default function SmartMirrorApp() {
  const [faceUid, setFaceUid] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mirrorSettings, setMirrorSettings] = useState<
    MirrorSettings | null | undefined
  >(undefined);

  // 💡 제미나이 답변 상태
  const [geminiReply, setGeminiReply] = useState<string | null>(null);

  // 💡 상세 뷰 선택 상태 (다시 추가!)
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>("");

  useEffect(() => {
    if (!faceUid) return;
    const unsubUser = onSnapshot(doc(db, "users", faceUid), (snapshot) => {
      if (snapshot.exists()) setCurrentUser(snapshot.data() as UserProfile);
      else setCurrentUser({ name: "사용자" });
    });
    const unsubMirror = onSnapshot(
      doc(db, "mirrorSettings", faceUid),
      (snapshot) => {
        if (snapshot.exists())
          setMirrorSettings(snapshot.data() as MirrorSettings);
        else setMirrorSettings(null);
      },
    );
    return () => {
      unsubUser();
      unsubMirror();
    };
  }, [faceUid]);

  // 💡 웹소켓 연결 (제미나이 답변 + 상세 뷰 명령 수신)
  useEffect(() => {
    if (!faceUid) return;

    const socket = new WebSocket("ws://127.0.0.1:8000/ws");
    let hideTimer: NodeJS.Timeout;
    let detailTimer: NodeJS.Timeout; // 상세뷰 자동 닫기 타이머

    socket.onmessage = (event) => {
      const rawData = String(event.data).trim();

      // 1. 제미나이 메시지 처리
      if (rawData.startsWith("GEMINI:")) {
        const reply = rawData.replace("GEMINI:", "").replace(/"/g, "");
        setGeminiReply(reply);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setGeminiReply(null), 15000);
      }

      // 2. ⚡ 상세 뷰 띄우기 명령 처리
      if (rawData.startsWith("SHOW_DETAIL:")) {
        const moduleType = rawData
          .replace("SHOW_DETAIL:", "")
          .replace(/"/g, "") as ModuleType;
        setSelectedModule(moduleType); // 상태 업데이트

        // 30초 뒤 상세 뷰 자동으로 닫기 (원치 않으시면 지워도 됩니다)
        if (detailTimer) clearTimeout(detailTimer);
        detailTimer = setTimeout(() => setSelectedModule(null), 30000);
      }
    };

    return () => {
      socket.close();
      if (hideTimer) clearTimeout(hideTimer);
      if (detailTimer) clearTimeout(detailTimer);
    };
  }, [faceUid]);

  const handleLogout = () => {
    setFaceUid(null);
    setCurrentUser(null);
    setMirrorSettings(undefined);
    setSelectedModule(null); // 로그아웃 시 닫기
  };

  if (!faceUid) return <LoginView onFaceLogin={setFaceUid} />;

  const slots = mirrorSettings?.slots || {};
  const name = currentUser?.name || "사용자";

  return (
    <div className="mirror-container dashboard-layout">
      {/* 로그아웃 버튼 */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 메인 화면 UI */}
      <div className="left-column">
        <div className="clock">
          <ClockWidget />
        </div>

        <div className="slot top-left">
          {renderSlotModule(slots["1"], currentUser)}
        </div>

        <div className="slot bottom-left">
          {renderSlotModule(slots["2"], currentUser)}
        </div>
      </div>

      {/* ⚡ 상세 뷰 렌더링 영역 (부활!) */}
      <div className="reflection-zone">
        {selectedModule && (
          <button
            className="detail-close-button"
            onClick={() => setSelectedModule(null)}
          >
            ×
          </button>
        )}
        {/* 일단 이부분 나중에 */}
        <DetailView selected={selectedModule} />
      </div>

      <div className="right-column">
        <div className="slot top-right">
          {renderSlotModule(slots["3"], currentUser)}
        </div>

        <div className="slot bottom-right">
          {renderSlotModule(slots["4"], currentUser)}
        </div>
      </div>
      {/* 메인 화면 UI */}

      {/* ✨ 제미나이 AI 답변 혹은 하단 인사말 */}
      {geminiReply && (
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "24px 40px",
            borderRadius: "24px",
            border: "1px solid #a855f7",
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)",
            fontSize: "28px",
            fontWeight: "bold",
            maxWidth: "80%",
            textAlign: "center",
            lineHeight: "1.4",
            zIndex: 100,
            animation: "fadeInUp 0.5s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "30px",
              marginRight: "16px",
              verticalAlign: "middle",
            }}
          ></span>
          <span style={{ verticalAlign: "middle" }}>{geminiReply}</span>
        </div>
        // ) : (
        //     <div className="footer-greeting">
        //         <span style={{ fontSize: '30px' }}>👤</span>
        //         <h2>반갑습니다! {name}님 무엇을 도와드릴까요?</h2>
        //     </div>
      )}
    </div>
  );
}
