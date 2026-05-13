// =======================================
// src/components/MusicWidget.tsx
// =======================================

import React, { useEffect, useState } from "react";

import "../styles/MusicWidget.css";

import { Music } from "lucide-react";

interface TrackData {
  title: string;

  artist: string;

  albumImage: string;

  progress: number;

  duration: number;
}

const MusicWidget: React.FC = () => {
  const [track, setTrack] = useState<TrackData | null>(null);

  const [loading, setLoading] = useState(true);

  // =====================================
  // MOCK MUSIC DATA
  // =====================================

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        // =========================
        // MOCK DATA
        // =========================

        const mockData = {
          item: {
            name: "Blinding Lights",

            artists: [
              {
                name: "The Weeknd",
              },
            ],

            album: {
              images: [
                {
                  url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
                },
              ],
            },

            duration_ms: 232000,
          },

          progress_ms: 95000,
        };

        console.log("mockData:", mockData);

        // =========================
        // 상태 저장
        // =========================

        setTrack({
          title: mockData.item.name,

          artist: mockData.item.artists.map((a: any) => a.name).join(", "),

          albumImage: mockData.item.album.images?.[0]?.url || "",

          progress: mockData.progress_ms,

          duration: mockData.item.duration_ms,
        });
      } catch (e) {
        console.error("음악 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  // =====================================
  // 시간 포맷
  // =====================================

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);

    const seconds = Math.floor((ms % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // =====================================
  // progress %
  // =====================================

  const progressPercent = track ? (track.progress / track.duration) * 100 : 0;

  // =====================================
  // loading
  // =====================================

  if (loading) {
    return (
      <div className="widget music-widget">음악 정보를 불러오는 중...</div>
    );
  }

  // =====================================
  // no music
  // =====================================

  if (!track) {
    return <div className="widget music-widget">현재 음악 정보 없음</div>;
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="widget music-widget">
      {/* 헤더 */}

      <div className="widget-header">
        <Music size={20} />
        <h3>PlayList</h3>
      </div>

      {/* 상단 */}

      <div className="music-top">
        {/* 앨범커버 */}

        <img src={track.albumImage} alt="album" className="album-cover" />

        {/* 정보 */}

        <div className="track-info">
          <div className="track-name">{track.title}</div>

          <div className="artist-name">{track.artist}</div>
        </div>
      </div>

      {/* 진행바 */}

      <div className="progress-wrapper">
        <div className="time-row">
          <span>{formatTime(track.progress)}</span>

          <span>{formatTime(track.duration)}</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* 컨트롤 */}

      <div className="music-controls">
        <button>⏮</button>

        <button className="play-button">⏸</button>

        <button>⏭</button>
      </div>
    </div>
  );
};

export default MusicWidget;
