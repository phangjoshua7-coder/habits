/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

// Types corresponding to custom gear bought from shop
interface AvatarSVGProps {
  level: number;
  racketType: string; // 'wood' | 'normal' | 'pro' | 'godly'
  shirtColor: string; // 'casual' | 'blue' | 'purple' | 'godly'
  pantsColor: string; // 'casual' | 'sport' | 'gold_pants'
  hasBadge: boolean;
  isSmashing?: boolean;
}

export const AvatarSVG: React.FC<AvatarSVGProps> = ({
  level,
  racketType,
  shirtColor,
  pantsColor,
  hasBadge,
  isSmashing = false,
}) => {
  // Determine actual items based on level thresholds
  const finalLevel = level;
  const isGodly = finalLevel >= 4;
  const isPro = finalLevel === 3;
  const isNormal = finalLevel === 2;
  const isCasual = finalLevel === 1;

  // Resolve visual properties
  let bodySkin = "#D4A373"; // Olive skin tone
  let hairColor = "#121212"; // Black hair

  // Resolving shirt color hex codes
  let shirtFill = "#E5E7EB"; // Casual white shirt
  if (shirtColor === "blue") shirtFill = "#3B82F6";
  else if (shirtColor === "purple") shirtFill = "#8B5CF6";
  else if (shirtColor === "godly" || isGodly) shirtFill = "url(#goldGrad)";
  else if (isPro) shirtFill = "#00FFCC"; // Pro teal jersey
  else if (isNormal) shirtFill = "#2C2C2C"; // Normal sporty dark

  // Resolving pants color
  let pantsFill = "#4B5563"; // Casual grey pants
  if (pantsColor === "sport") pantsFill = "#0D0D0D";
  else if (pantsColor === "gold_pants" || isGodly) pantsFill = "url(#goldGradPants)";
  else if (isPro) pantsFill = "#1E1B4B"; // Indigo pro shorts

  // Racket rendering values
  let racketHeadLabel = "WOODEN";
  let racketStroke = "#A16207"; // Brown string grid for wooden
  let racketOuter = "#78350F"; 
  let glowColor = "rgba(0,0,0,0)";

  if (racketType === "godly" || isGodly) {
    racketHeadLabel = "GODLY";
    racketStroke = "#FF3366";
    racketOuter = "#FFFF00";
    glowColor = "#FFFF00";
  } else if (racketType === "pro" || isPro) {
    racketHeadLabel = "PRO";
    racketStroke = "#00FFCC";
    racketOuter = "#FF3366";
    glowColor = "#00FFCC";
  } else if (racketType === "normal" || isNormal) {
    racketHeadLabel = "NML";
    racketStroke = "#E5E7EB";
    racketOuter = "#00FFCC";
    glowColor = "#3B82F6";
  }

  return (
    <div className="relative w-full h-[280px] bg-[#141414] border border-[#2A2A2A] rounded-[22px] flex items-center justify-center overflow-hidden p-4">
      {/* Background Anime Speed Lines & Sparkles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="0" x2="40%" y2="100%" stroke="#00FFCC" strokeWidth="1" />
          <line x1="90%" y1="0" x2="60%" y2="100%" stroke="#FF3366" strokeWidth="1" />
          <line x1="30%" y1="0" x2="50%" y2="100%" stroke="#00FFCC" strokeWidth="0.5" />
          <line x1="70%" y1="0" x2="50%" y2="100%" stroke="#FF3366" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Extreme Visual FX Trails */}
      {finalLevel >= 2 && (
        <div className={`absolute inset-0 pointer-events-none z-10 animate-pulse ${finalLevel >= 3 ? "mix-blend-screen" : ""}`}>
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {finalLevel === 2 && (
              /* Level 2: White Trails */
              <>
                <path d="M 20,120 Q 50,70 110,80" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                <circle cx="110" cy="80" r="3" fill="#FFFFFF" />
              </>
            )}
            {finalLevel === 3 && (
              /* Level 3: Blue Energy Trails */
              <>
                <path d="M 10,130 C 50,40 150,40 190,130" fill="none" stroke="#00FFCC" strokeWidth="3" opacity="0.8" />
                <path d="M 25,110 C 70,50 130,50 175,110" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 3" />
              </>
            )}
            {finalLevel >= 4 && (
              /* Level 4+: Golden Halo & Gold Aura Trails */
              <>
                <circle cx="100" cy="55" r="35" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeDasharray="20 5" className="animate-[spin_20s_linear_infinite]" />
                <circle cx="100" cy="55" r="41" fill="none" stroke="#FF3366" strokeWidth="1" opacity="0.5" />
              </>
            )}
          </svg>
        </div>
      )}

      {/* Main Vector Drawing of the Anime Sports Hero */}
      <svg
        className={`w-full h-full max-w-[200px] transition-transform duration-300 ${isSmashing ? "scale-110 -translate-y-4" : "animate-[bounce_3s_ease-in-out_infinite]"}`}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE259" />
            <stop offset="100%" stopColor="#FFA751" />
          </linearGradient>
          <linearGradient id="goldGradPants" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="auraGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 51, 102, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 51, 102, 0)" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Ambient Aura Background */}
        {finalLevel >= 4 && (
          <path d="M 50,20 L 150,20 L 180,180 L 20,180 Z" fill="url(#auraGlow)" filter="url(#shadow)" opacity="0.6" />
        )}

        {/* Level 3+ Blue Aura Particles */}
        {finalLevel >= 3 && (
          <g fill="#00FFCC" opacity="0.8">
            <circle cx="45" cy="50" r="2" />
            <circle cx="160" cy="70" r="3" className="animate-ping" />
            <circle cx="50" cy="150" r="1.5" />
            <circle cx="150" cy="140" r="2" />
          </g>
        )}

        {/* Body Base & Stance: Strong Muscular Anime proportions */}
        <g id="body" filter="url(#shadow)">
          {/* Olive Arms */}
          {/* Left Shooting arm (dramatic badminton pose ready to hit) */}
          <path d="M 50,85 C 40,75 25,60 20,50 C 15,45 20,40 25,45 C 32,52 50,75 55,80 Z" fill={bodySkin} />
          {/* Right Arm holding racket high up */}
          <path d="M 135,80 C 145,70 160,50 168,36 C 172,30 178,32 176,38 C 172,48 150,78 142,84 Z" fill={bodySkin} />

          {/* Olive Legs */}
          {/* Left Muscular Leg */}
          <path d="M 75,130 L 70,175 L 60,175 L 68,130 Z" fill={bodySkin} />
          {/* Right Muscular Leg (athletic bent shape) */}
          <path d="M 120,130 L 125,160 L 138,175 L 145,172 L 130,155 L 125,130 Z" fill={bodySkin} />

          {/* Footwear */}
          {finalLevel >= 3 ? (
            /* Professional Flying Shoes (Level 3+) */
            <>
              <path d="M 58,172 L 72,172 L 70,180 L 56,180 Z" fill="#FF3366" />
              <path d="M 134,171 L 148,171 L 144,179 L 130,179 Z" fill="#00FFCC" />
            </>
          ) : finalLevel === 2 ? (
            /* Level 2 Sporty Shoes */
            <>
              <path d="M 58,172 L 72,172 L 70,180 L 56,180 Z" fill="#0D0D0D" />
              <path d="M 134,171 L 148,171 L 144,179 L 130,179 Z" fill="#0D0D0D" />
            </>
          ) : (
            /* Level 1 Sandals */
            <>
              <path d="M 58,175 L 72,175" stroke="#78350F" strokeWidth="2.5" />
              <path d="M 134,174 L 148,174" stroke="#78350F" strokeWidth="2.5" />
            </>
          )}

          {/* Torso & Athletic Muscle Shirt */}
          <path d="M 60,80 L 135,80 L 125,135 L 70,135 Z" fill={shirtFill} stroke="#2C2C2C" strokeWidth="1" />
          
          {/* Inner Jersey Stripe Details (Active lines) */}
          <path d="M 70,80 L 75,135" stroke={finalLevel >= 3 ? "#FF3366" : "#00FFCC"} strokeWidth="2" opacity="0.6" />
          <path d="M 125,80 L 115,135" stroke={finalLevel >= 3 ? "#00FFCC" : "#FF3366"} strokeWidth="2" opacity="0.6" />

          {/* Pants/Shorts */}
          <path d="M 70,132 L 125,132 L 125,150 L 105,150 L 98,140 L 90,150 L 70,150 Z" fill={pantsFill} stroke="#2C2C2C" strokeWidth="0.5" />

          {/* Golden Shoulder Guard / Spikes for Level 4+ Godly Gear */}
          {finalLevel >= 4 && (
            <>
              <path d="M 55,75 L 45,70 L 52,85 Z" fill="#FFD700" stroke="#FF3366" />
              <path d="M 135,75 L 145,70 L 138,85 Z" fill="#FFD700" stroke="#FFD700" />
            </>
          )}

          {/* Custom Account Badge (rare emblem displayed on chest center) */}
          {hasBadge && (
            <path d="M 92,90 L 103,90 L 108,98 L 98,106 L 88,98 Z" fill="#FF3366" stroke="#00FFCC" strokeWidth="1" />
          )}

          {/* Head & Neck */}
          <path d="M 90,82 L 105,82 L 102,70 L 93,70 Z" fill={bodySkin} />
          {/* Anime chin & head face shape */}
          <path d="M 85,55 C 85,73 98,80 100,80 C 102,80 115,73 115,55 C 115,40 100,38 100,38 C 100,38 85,40 85,55 Z" fill={bodySkin} />

          {/* Hero Expression Details (Anime Big Black Eyes & Serious expression) */}
          {/* Eyes */}
          <ellipse cx="92" cy="56" rx="3.5" ry="4" fill="#0D0D0D" />
          <ellipse cx="108" cy="56" rx="3.5" ry="4" fill="#0D0D0D" />
          {/* Highlights in eyes for anime aesthetic */}
          <circle cx="93.5" cy="54" r="1.2" fill="#FFFFFF" />
          <circle cx="109.5" cy="54" r="1.2" fill="#FFFFFF" />
          {/* Sharp Anime eyebrows */}
          <path d="M 87,51 L 97,52" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 113,51 L 103,52" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          {/* Serious mouth */}
          <path d="M 95,68 Q 100,66 105,68" stroke="#000" strokeWidth="1.2" fill="none" />

          {/* Normal fade & black spiky hair */}
          <path d="M 83,50 C 78,40 86,28 92,26 C 96,22 104,22 108,26 C 114,28 122,40 117,50 C 115,45 112,46 110,40 C 105,38 100,30 95,40 C 92,38 88,43 83,50 Z" fill={hairColor} />
          {/* Sidelocks */}
          <path d="M 85,48 L 86,58 L 90,54 Z" fill={hairColor} />
          <path d="M 115,48 L 114,58 L 110,54 Z" fill={hairColor} />
        </g>

        {/* Dynamic shuttlecock for Level 2+ */}
        {finalLevel >= 2 && (
          <g transform={`translate(${isSmashing ? "60, 110" : "40, 50"})`} className="animate-[pulse_1.5s_infinite]">
            {/* Shuttelcock feathers */}
            <path d="M 10,12 L 20,4 L 30,12 Z" fill="#F9FAFB" stroke={finalLevel >= 3 ? "#00FFCC" : "#9CA3AF"} strokeWidth="1" />
            {/* Base cork */}
            <circle cx="20" cy="14" r="4.5" fill={finalLevel >= 3 ? "#FF3366" : "#EF4444"} />
            {/* Aura Trails */}
            {finalLevel >= 3 && (
              <path d="M 10,8 Q -5,12 10,15" stroke="#00FFCC" strokeWidth="2" fill="none" opacity="0.8" />
            )}
          </g>
        )}

        {/* Dynamic Badminton Racket */}
        <g id="racket" transform="translate(142, 84) rotate(-30)" filter="url(#shadow)">
          {/* Racket shaft */}
          <line x1="0" y1="0" x2="35" y2="-45" stroke="#FFFFFF" strokeWidth="1.8" />
          {/* Wooden wrap handle */}
          <line x1="0" y1="0" x2="8" y2="-10" stroke={racketOuter} strokeWidth="2.8" />
          {/* T-joint / Head */}
          <ellipse cx="45" cy="-56" rx="14" ry="18" fill="none" stroke={racketOuter} strokeWidth="3" transform="rotate(35, 45, -56)" />
          {/* Strings inside head */}
          <g opacity="0.8" transform="rotate(35, 45, -56)">
            <line x1="45" y1="-74" x2="45" y2="-38" stroke={racketStroke} strokeWidth="0.8" />
            <line x1="39" y1="-72" x2="39" y2="-40" stroke={racketStroke} strokeWidth="0.8" />
            <line x1="51" y1="-72" x2="51" y2="-40" stroke={racketStroke} strokeWidth="0.8" />
            
            <line x1="31" y1="-56" x2="59" y2="-56" stroke={racketStroke} strokeWidth="0.8" />
            <line x1="32" y1="-50" x2="58" y2="-50" stroke={racketStroke} strokeWidth="0.8" />
            <line x1="32" y1="-62" x2="58" y2="-62" stroke={racketStroke} strokeWidth="0.8" />
          </g>
          {/* Smash glow overlay */}
          {glowColor !== "rgba(0,0,0,0)" && (
            <ellipse cx="45" cy="-56" rx="17" ry="21" fill="none" stroke={glowColor} strokeWidth="1" opacity="0.6" transform="rotate(35, 45, -56)" className="animate-ping" />
          )}
        </g>
      </svg>

      {/* Hero Badge Tag */}
      <div className="absolute top-3 left-3 bg-[#0D0D0D]/90 px-3 py-1 rounded-full border border-secondary/20 flex items-center space-x-1">
        <span className="text-[10px] font-mono font-bold text-secondary">LV.</span>
        <span className="text-sm font-bold text-[#FFFFFF]">{finalLevel}</span>
      </div>

      {/* Stance Title tag */}
      <span className="absolute bottom-3 right-3 text-[10px] font-mono uppercase bg-[#1A1A1A] text-gray-400 px-2 py-0.5 rounded border border-[#2C2C2C]">
        {finalLevel >= 4 ? "Godly Form" : finalLevel === 3 ? "Pro Matcher" : finalLevel === 2 ? "Aspirant" : "Novice Recruit"}
      </span>
    </div>
  );
};


// ENEMY SVG ILLUSTRATIONS
interface EnemySVGProps {
  id: "lining" | "victor" | "yonex";
  damageShake?: boolean;
}

export const EnemySVG: React.FC<EnemySVGProps> = ({ id, damageShake = false }) => {
  // Configs
  let name = "Li Ning";
  let skin = "#FFD1A4";
  let colorTheme = "#FF3366"; // Li Ning theme red
  let description = "Li Ning: Casual Outfit & Cheap Wooden Racket";
  let headGradStart = "#EF4444";
  let headGradEnd = "#7F1D1D";

  if (id === "victor") {
    name = "Victor";
    skin = "#FCD34D";
    colorTheme = "#3B82F6"; // Victor blue
    description = "Victor: European High Pro Standard Jersey";
    headGradStart = "#2563EB";
    headGradEnd = "#1E3A8A";
  } else if (id === "yonex") {
    name = "Yonex";
    skin = "#8B5CF6"; 
    colorTheme = "#8B5CF6"; // Dark purple godly Yonex
    description = "Yonex: Godly Dark Aura Legendary Champion";
    headGradStart = "#4C1D95";
    headGradEnd = "#1E1B4B";
  }

  return (
    <div
      className={`relative w-full h-[220px] bg-[#0A0A0A] border rounded-[22px] flex items-center justify-center overflow-hidden p-4 ${
        damageShake ? "animate-[shake_0.5s_ease-in-out] border-accent" : "border-[#2A2A2A]"
      }`}
    >
      {/* Dark Energy Field or Sports Court Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full">
          <circle cx="100" cy="110" r="80" fill="none" stroke={colorTheme} strokeWidth="1" strokeDasharray="4 2" />
          <path d="M 0,110 L 200,110" stroke={colorTheme} strokeWidth="0.5" />
        </svg>
      </div>

      {/* Godly Dark Purple Aura overlay for Yonex */}
      {id === "yonex" && (
        <div className="absolute inset-0 bg-radial-gradient from-purple-900/40 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* Enemy Vector Image */}
      <svg
        className={`w-full h-full max-w-[160px] ${id === "yonex" ? "animate-[bounce_2s_ease-in-out_infinite]" : "animate-[bounce_4.5s_ease-in-out_infinite]"}`}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="enemyAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colorTheme} stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow Ground Aura */}
        <ellipse cx="100" cy="175" rx="55" ry="12" fill="url(#enemyAura)" />

        {/* Mildly Menacing Evil eyes / horns effects for badminton bosses */}
        {id === "yonex" && (
          <g stroke="#FF3366" strokeWidth="2" fill="none" opacity="0.8" className="animate-pulse">
            <path d="M 40,55 L 20,40 M 160,55 L 180,40" />
            <circle cx="100" cy="100" r="50" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="5 5" />
          </g>
        )}

        {/* Arms and Outfit */}
        {/* Left blocking arm holding racket */}
        <path d="M 45,95 C 32,85 15,68 12,60 C 8,55 12,50 18,52 C 26,55 45,80 50,86 Z" fill="#D1FAE5" />
        {/* Right athletic posture arm */}
        <path d="M 155,95 C 168,85 185,68 188,60 C 192,55 188,50 182,52 C 174,55 155,80 150,86 Z" fill="#D1FAE5" />

        {/* Core Torso & Sports Jersey */}
        <path d="M 60,90 L 140,90 L 130,145 L 70,145 Z" fill={id === "yonex" ? "#1F1F1F" : id === "victor" ? "#1E3A8A" : "#B91C1C"} stroke="#000" strokeWidth="1" />
        {/* Sponsor/Logo stripes mapping the Enemy tier */}
        {id === "yonex" && (
          <path d="M 85,90 L 100,120 L 115,90" stroke="#FFD700" strokeWidth="3" fill="none" />
        )}
        {id === "victor" && (
          <path d="M 70,110 L 130,110" stroke="#FFF" strokeWidth="2" opacity="0.6" />
        )}
        {id === "lining" && (
          <circle cx="100" cy="115" r="10" fill="none" stroke="#FFF" strokeWidth="1" />
        )}

        {/* Athletic Shorts */}
        <path d="M 70,143 L 130,143 L 130,165 L 105,165 L 100,155 L 95,165 L 70,165 Z" fill="#0D0D0D" stroke="#000" strokeWidth="0.5" />

        {/* Menacing Sports Head */}
        <path d="M 90,92 L 110,92 L 105,80 L 95,80 Z" fill="#D1FAE5" />
        <path d="M 82,60 C 82,78 95,88 100,88 C 105,88 118,78 118,60 C 118,45 100,42 100,42 C 100,42 82,45 82,60 Z" fill="#D1FAE5" />

        {/* Evil Angry Expression (Large expressive eyes, dramatic pose) */}
        {/* Eyebrows angled extremely down */}
        <path d="M 84,54 L 96,59" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <path d="M 116,54 L 104,59" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        {/* Glow red pupiles on Yonex, evil blue on Victor, standard black on Li Ning */}
        <ellipse cx="91" cy="62" rx="4" ry="3" fill={id === "yonex" ? "#FF3366" : id === "victor" ? "#3B82F6" : "#0D0D0D"} />
        <ellipse cx="109" cy="62" rx="4" ry="3" fill={id === "yonex" ? "#FF3366" : id === "victor" ? "#3B82F6" : "#0D0D0D"} />
        <circle cx="91" cy="61" r="1" fill="#FFF" />
        <circle cx="109" cy="61" r="1" fill="#FFF" />

        {/* Smug evil mouth smile */}
        <path d="M 92,76 Q 100,84 108,74" stroke="#000" strokeWidth="2" fill="none" />

        {/* Spiky Anime Rival Hair */}
        <path
          d="M 80,55 C 75,40 76,26 84,20 C 90,15 110,15 116,20 C 124,26 125,40 120,55 C 115,48 110,48 105,42 C 100,30 95,42 90,48 Z"
          fill={id === "yonex" ? "#4C1D95" : id === "victor" ? "#F59E0B" : "#1E293B"}
        />

        {/* Cheap wooden racket for Li ning, professional blue racket for Victor, Godly dark shadow racket for Yonex */}
        <g transform="translate(14, 58) rotate(20)">
          <line x1="0" y1="0" x2="-20" y2="-20" stroke="#FFF" strokeWidth="1" />
          <ellipse cx="-26" cy="-26" rx="9" ry="11" fill="none" stroke={id === "yonex" ? "#FF3366" : id === "victor" ? "#00FFCC" : "#78350F"} strokeWidth="2" />
          {id === "yonex" && (
            <ellipse cx="-26" cy="-26" rx="14" ry="16" fill="none" stroke="#8B5CF6" strokeWidth="0.8" opacity="0.4" className="animate-pulse" />
          )}
        </g>
      </svg>

      {/* Rival Indicators */}
      <div className="absolute top-3 left-3 flex flex-col items-start">
        <span className="text-[10px] font-mono tracking-wider text-[#FF3366] uppercase font-bold">Rival threat</span>
        <span className="text-sm font-extrabold text-white text-shadow">{name}</span>
      </div>

      <div className="absolute bottom-3 right-3 bg-primary/80 border border-secondary/10 px-2.5 py-1 rounded-full flex items-center space-x-1">
        <span className="text-[10px] font-mono text-secondary">Fierce:</span>
        <span className="text-xs font-bold text-white">{id === "yonex" ? "⭐⭐⭐⭐⭐" : id === "victor" ? "⭐⭐⭐" : "⭐⭐"}</span>
      </div>
    </div>
  );
};
