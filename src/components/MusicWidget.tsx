import "../styles/MusicWidget.css";

const MusicWidget: React.FC = () => (
  <div className="widget music-widget">
    {/* 404 에러 안 뜨는 실제 스포티파이 플레이리스트 링크 */}
    <iframe 
      style={{ borderRadius: '12px' }}
      src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
      width="100%" 
      height="152" 
      frameBorder="0" 
      allowFullScreen={false}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify Player"
    ></iframe>
  </div>
);

export default MusicWidget;