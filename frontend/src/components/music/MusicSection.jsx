function MusicSection({ title, subtitle, isEmpty, emptyMessage, children }) {
  return (
    <section className="sf-music-section">
      <div className="sf-section-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      {isEmpty ? (
        <div className="sf-empty-panel">{emptyMessage}</div>
      ) : (
        <div className="sf-music-grid">{children}</div>
      )}
    </section>
  );
}

export default MusicSection;