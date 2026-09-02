export function HeartIcon({ filled, className = "h-4 w-4" }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      className={`${className} ${filled ? "text-velvet" : ""}`}
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-9.9-9.1C.6 8.1 2 4.8 5.2 4.1c2-.4 3.9.5 5.1 2.2l1.7 2.4 1.7-2.4c1.2-1.7 3.1-2.6 5.1-2.2 3.2.7 4.6 4 3.1 7.3-2.4 4.5-9.9 9.1-9.9 9.1Z" />
    </svg>
  );
}
