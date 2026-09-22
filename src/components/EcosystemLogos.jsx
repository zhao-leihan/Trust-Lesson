export default function EcosystemLogos() {
  return (
    <div className="flex items-center gap-5 sm:gap-6 text-white/90 text-xs sm:text-sm font-bold tracking-wider">
      {/* USDC */}
      <div className="flex items-center gap-2">
        <img
          src="https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png"
          alt="USDC"
          className="w-5 h-5 rounded-full object-contain"
        />
        <span className="tracking-widest">USDC</span>
      </div>

      {/* USDT */}
      <div className="flex items-center gap-2">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
          alt="USDT"
          className="w-5 h-5 rounded-full object-contain"
        />
        <span className="tracking-widest">USDT</span>
      </div>

      {/* Divider */}
      <span className="h-6 w-px bg-white/25 inline-block" />

      {/* ARBITRUM */}
      <div className="flex items-center gap-2">
        <img
          src="https://wp.logos-download.com/wp-content/uploads/2024/01/Arbitrum_Logo.png?dl"
          alt="Arbitrum"
          className="w-5 h-5 object-contain"
        />
        <span className="tracking-widest">ARBITRUM</span>
      </div>
    </div>
  );
}
