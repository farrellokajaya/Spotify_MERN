function IconButton({ icon: Icon, label, className = "sf-icon-button", iconSize = 18, children, ...buttonProps }) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={buttonProps.title || label}
      {...buttonProps}
    >
      {Icon ? <Icon size={iconSize} aria-hidden="true" /> : children}
    </button>
  );
}

export default IconButton;
