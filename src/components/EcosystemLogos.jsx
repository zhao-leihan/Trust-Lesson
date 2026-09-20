export default function EcosystemLogos() {
  return (
    <div className="flex items-center gap-5 sm:gap-6 text-white/90 text-xs sm:text-sm font-bold tracking-wider">
      {/* USDC */}
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#2775CA" />
          <path
            d="M16 5.5C10.2 5.5 5.5 10.2 5.5 16C5.5 21.8 10.2 26.5 16 26.5C21.8 26.5 26.5 21.8 26.5 16C26.5 10.2 21.8 5.5 16 5.5ZM17.3 22.5V23.7H14.7V22.5C12.3 22.1 11.2 20.6 11.2 19.1H13.2C13.2 20.1 14.1 20.9 15.6 20.9C17 20.9 17.8 20.2 17.8 19.3C17.8 18.2 16.9 17.8 15.1 17.3C12.7 16.6 11.5 15.6 11.5 13.7C11.5 12 12.8 10.7 14.7 10.4V9.2H17.3V10.4C19.4 10.8 20.4 12.1 20.5 13.5H18.5C18.4 12.6 17.7 11.9 16.4 11.9C15.1 11.9 14.3 12.6 14.3 13.4C14.3 14.3 15.2 14.8 16.8 15.3C19.2 16 20.6 16.9 20.6 18.9C20.6 20.7 19.2 22.1 17.3 22.5Z"
            fill="white"
          />
        </svg>
        <span className="tracking-widest">USDC</span>
      </div>

      {/* USDG */}
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#10B981" />
          <path
            d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C21.5 26 26 21.5 26 16C26 10.5 21.5 6 16 6ZM17 22V23.5H15V22C13 21.6 12 20.2 12 19H13.8C13.8 19.8 14.6 20.5 15.8 20.5C17 20.5 17.8 19.9 17.8 19.1C17.8 18.1 17 17.7 15.4 17.2C13.2 16.6 12.2 15.7 12.2 13.9C12.2 12.4 13.3 11.2 15 10.9V9.5H17V10.9C18.8 11.2 19.7 12.4 19.8 13.6H18C17.9 12.8 17.3 12.2 16.2 12.2C15.1 12.2 14.4 12.8 14.4 13.5C14.4 14.3 15.1 14.7 16.5 15.2C18.7 15.8 20 16.6 20 18.5C20 20.2 18.8 21.6 17 22Z"
            fill="white"
          />
        </svg>
        <span className="tracking-widest">USDG</span>
      </div>

      {/* Divider */}
      <span className="h-6 w-px bg-white/25 inline-block" />

      {/* ARBITRUM */}
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
          <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="#213147" />
          <path d="M68.5 70L50 35.5L41 52.5L50 69.5L68.5 70Z" fill="#28A0F0" />
          <path d="M31.5 70L45.5 43.5L37 27.5L18.5 62L31.5 70Z" fill="#96BEDC" />
          <path d="M50 35.5L64 62L76.5 53.5L54.5 12L50 35.5Z" fill="#12AAFF" />
        </svg>
        <span className="tracking-widest">ARBITRUM</span>
      </div>
    </div>
  );
}
