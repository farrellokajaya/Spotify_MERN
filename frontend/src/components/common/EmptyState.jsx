function EmptyState({ title, message, action, className = "", children }) {
  return (
    <div className={`sf-empty-panel sf-state-panel ${className}`.trim()}>
      {title ? <strong className="sf-state-title">{title}</strong> : null}
      {message ? <p>{message}</p> : null}
      {children}
      {action ? <div className="sf-state-action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
