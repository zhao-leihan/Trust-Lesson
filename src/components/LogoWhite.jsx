export default function LogoWhite({ className = "h-8 sm:h-9 w-auto" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 text-white"
      >
        {/* Graduation cap mortarboard */}
        <path d="M24 6L2 17L24 28L44 17.5V26H47V17L24 6Z" fill="currentColor" />
        <path
          d="M11 23V31C11 36.5 16.8 41 24 41C31.2 41 37 36.5 37 31V23L24 29.5L11 23Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-sans whitespace-nowrap">
        Trust lesson
      </span>
    </div>
  );
}
