// Flat SVG illustrations for mentor cards
export const illustrations = {
  coding: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="90" height="60" rx="8" fill="rgba(255,255,255,0.15)" />
      <rect x="25" y="30" width="70" height="40" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="30" y="36" width="20" height="4" rx="2" fill="#FFC83D" />
      <rect x="30" y="44" width="35" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
      <rect x="30" y="52" width="28" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
      <rect x="30" y="60" width="40" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="85" cy="40" r="12" fill="rgba(255,255,255,0.2)" />
      <text x="80" y="45" fontSize="12" fill="white" fontWeight="bold">{`{}`}</text>
    </svg>
  ),
  career: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="35" r="18" fill="rgba(255,255,255,0.25)" />
      <rect x="42" y="28" width="36" height="14" rx="7" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="60" cy="34" rx="10" ry="10" fill="rgba(255,255,255,0.3)" />
      <circle cx="60" cy="32" r="5" fill="rgba(255,255,255,0.6)" />
      <rect x="30" y="58" width="60" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
      <rect x="38" y="70" width="44" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
      <rect x="50" y="80" width="20" height="5" rx="2.5" fill="rgba(255,255,255,0.1)" />
    </svg>
  ),
  language: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="45" cy="42" rx="22" ry="18" fill="rgba(255,255,255,0.2)" />
      <ellipse cx="75" cy="55" rx="20" ry="16" fill="rgba(255,255,255,0.2)" />
      <text x="33" y="47" fontSize="13" fill="white" fontWeight="600">Hola</text>
      <text x="58" y="60" fontSize="12" fill="rgba(255,255,255,0.9)" fontWeight="500">Hi!</text>
      <circle cx="90" cy="28" r="8" fill="rgba(255,255,255,0.15)" />
      <circle cx="30" cy="72" r="6" fill="rgba(255,255,255,0.15)" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="18" width="5" height="48" rx="2.5" fill="rgba(255,255,255,0.6)" />
      <rect x="55" y="18" width="22" height="12" rx="3" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="47" cy="68" rx="12" ry="9" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="47" cy="67" rx="8" ry="6" fill="rgba(255,255,255,0.5)" />
      <circle cx="80" cy="40" r="10" fill="rgba(255,255,255,0.15)" />
      <rect x="76" y="35" width="2" height="10" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="80" y="33" width="2" height="14" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="84" y="37" width="2" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="80" height="55" rx="10" fill="rgba(255,255,255,0.15)" />
      <rect x="30" y="35" width="35" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
      <rect x="30" y="44" width="50" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="30" y="52" width="42" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="80" cy="62" r="12" fill="#FFC83D" />
      <text x="74" y="67" fontSize="14" fill="#2A2A5A" fontWeight="700">↑</text>
    </svg>
  ),
  design: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="16" fill="rgba(255,255,255,0.3)" />
      <circle cx="65" cy="35" r="12" fill="rgba(255,200,61,0.5)" />
      <circle cx="55" cy="60" r="14" fill="rgba(255,255,255,0.2)" />
      <rect x="75" y="50" width="30" height="5" rx="2.5" fill="rgba(255,255,255,0.4)" transform="rotate(-20 75 50)" />
      <circle cx="100" cy="65" r="5" fill="rgba(255,255,255,0.5)" />
    </svg>
  ),
};

export const getIllustration = (category, color) => {
  const map = {
    Coding: illustrations.coding,
    Career: illustrations.career,
    Languages: illustrations.language,
    Music: illustrations.music,
    Business: illustrations.product,
    Design: illustrations.design,
    Art: illustrations.design,
  };
  return map[category] || illustrations.coding;
};
