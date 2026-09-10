export default function BridgeSketch() {
  return (
    <svg
      viewBox="0 0 900 430"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* ================= SKYLINE ================= */}
      <g fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* ground line under skyline */}
        <line x1="30" y1="160" x2="870" y2="160" strokeWidth="2" />

        {/* ---- Howrah-Bridge-style truss, far left ---- */}
        <g>
          <line x1="55" y1="160" x2="55" y2="105" />
          <line x1="55" y1="105" x2="70" y2="105" />
          <path d="M70 120 Q140 78 210 120" strokeWidth="3" fill="none" />
          <line x1="70" y1="120" x2="210" y2="120" />
          {Array.from({ length: 9 }).map((_, i) => {
            const x0 = 70 + i * 17.5;
            const x1 = 70 + (i + 1) * 17.5;
            return (
              <g key={i}>
                <line x1={x0} y1="120" x2={x1} y2="90" />
                <line x1={x1} y1="90" x2={x1} y2="120" />
                <line x1={x0} y1="90" x2={x1} y2="120" />
              </g>
            );
          })}
          <line x1="210" y1="120" x2="210" y2="160" />
          <line x1="225" y1="105" x2="225" y2="160" />
        </g>

        {/* ---- mid buildings with stepped tops / crenellations ---- */}
        <path d="M235 160 V128 H250 V118 H262 V128 H278 V108 H292 V128 H308 V118 H322 V128 H338 V160 Z" />

        {/* ---- slim clock-tower / minaret ---- */}
        <path d="M345 160 V70 L358 50 L371 70 V160 Z" />
        <line x1="358" y1="50" x2="358" y2="38" />

        {/* ---- domed building (Victoria-memorial style) ---- */}
        <path d="M385 160 V95 H400 V80 A28 28 0 0 1 456 80 H471 V95 H486 V160 Z" />
        <line x1="428" y1="80" x2="428" y2="58" />
        <circle cx="428" cy="52" r="5" />

        {/* ---- onion-arch pavilion ---- */}
        <path d="M500 160 V118 Q515 92 530 118 V160 Z" />
        <path d="M535 160 V128 H548 V138 H562 V128 H575 V160 Z" />

        {/* ---- tall spired tower ---- */}
        <path d="M585 160 V95 L602 62 L619 95 V160 Z" />

        {/* ---- modern block buildings, right side ---- */}
        <path d="M630 160 V100 H655 V85 H690 V100 H715 V70 H745 V100 H770 V125 H800 V100 H825 V160 Z" />

        {/* small window notches for texture on the modern blocks */}
        <g strokeWidth="1.6">
          <line x1="640" y1="110" x2="648" y2="110" />
          <line x1="640" y1="125" x2="648" y2="125" />
          <line x1="640" y1="140" x2="648" y2="140" />
          <line x1="700" y1="95" x2="708" y2="95" />
          <line x1="700" y1="110" x2="708" y2="110" />
          <line x1="754" y1="80" x2="762" y2="80" />
          <line x1="754" y1="95" x2="762" y2="95" />
          <line x1="754" y1="110" x2="762" y2="110" />
        </g>
      </g>

      {/* rule lines echoing the reference layout */}
      <line x1="20" y1="180" x2="880" y2="180" stroke="#1a1a1a" strokeWidth="2" />
      <line x1="20" y1="330" x2="880" y2="330" stroke="#1a1a1a" strokeWidth="2" />

      {/* ================= WORDMARK ================= */}
      <text
        x="450"
        y="290"
        textAnchor="middle"
        fontFamily="'Noto Sans Bengali', 'Hind Siliguri', sans-serif"
        fontWeight="900"
        fontSize="185"
        fill="#e9d872"
        stroke="#1a1a1a"
        strokeWidth="9"
        paintOrder="stroke"
        style={{ letterSpacing: '2px' }}
      >
        কলকাতা
      </text>

      {/* ================= TAXI ================= */}
      <g transform="translate(500,255)">
        {/* body */}
        <path
          d="M10 95
             Q10 70 40 68
             L70 68
             Q85 40 120 40
             L195 40
             Q225 40 235 68
             L260 70
             Q285 72 285 95
             L285 108
             L10 108 Z"
          fill="#f2b23c"
          stroke="#1a1a1a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* roof accent */}
        <path d="M90 68 Q100 46 122 46 L192 46 Q212 46 222 68 Z" fill="#f7c766" stroke="#1a1a1a" strokeWidth="3" />
        {/* windows */}
        <path d="M100 66 Q108 52 124 52 L154 52 L154 66 Z" fill="#bfe3ea" stroke="#1a1a1a" strokeWidth="2.5" />
        <path d="M160 52 L188 52 Q206 52 214 66 L160 66 Z" fill="#bfe3ea" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* door + trim lines */}
        <line x1="156" y1="68" x2="156" y2="108" stroke="#1a1a1a" strokeWidth="2.5" />
        <line x1="18" y1="88" x2="278" y2="88" stroke="#1a1a1a" strokeWidth="2" />
        {/* headlight + bumper hint */}
        <circle cx="270" cy="95" r="4" fill="#fff6d8" stroke="#1a1a1a" strokeWidth="2" />
        {/* wheels */}
        <circle cx="65" cy="110" r="22" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="65" cy="110" r="9" fill="#f2b23c" />
        <circle cx="228" cy="110" r="22" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="228" cy="110" r="9" fill="#f2b23c" />
      </g>
    </svg>
  );
}