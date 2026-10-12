import './KolkataRiverScene.css';

// A lightweight, decorative SVG: no video, network requests, or animation timers.
export default function KolkataRiverScene() {
  return (
    <div className="kolkata-scene">
      <svg viewBox="0 0 560 260" fill="none" aria-hidden="true" focusable="false">
        <circle cx="418" cy="68" r="31" fill="#f4dfb1" />
        <g className="river-cloud" stroke="#dfe5df" strokeWidth="2" strokeLinecap="round">
          <path d="M75 58h48m-32-8h45M302 35h42m-25-8h40" />
        </g>
        <g fill="#e6ebe4">
          <path d="M32 171v-24h19v-9h17v33m-6 0v-36h24v36m370 0v-30h17v-12h12v42m-5 0v-22h26v22m6 0v-39h12v39" />
          <path d="M5 176h550v7H5z" />
        </g>
        {/* Cantilever towers and triangulated spans evoke Howrah Bridge. */}
        <g stroke="#78938b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M26 160h508M28 169h504M139 169V76h12v93M409 169V76h12v93" />
          <path d="M28 159 139 87l81 51h120l81-51 111 72M151 88l69 66h120l69-66" />
          <path d="M51 145v15l22-30v30l22-44v44l22-58v58M163 104v56l20-43v43l20-29v29M224 139l19 21 19-21 19 21 19-21 19 21 19-21M356 131v29l20-43v43l20-56v56M443 102v58l22-44v44l22-30v30l22-15v15" opacity=".7" />
          <path d="M139 169v17h12v-17m258 0v17h12v-17" />
        </g>
        <path d="M16 190h528" stroke="#c9dcd6" />
        <g className="river-ripples" stroke="#c9dcd6" strokeWidth="1.5" strokeLinecap="round">
          <path d="M40 207h53m56 12h77m178-12h63m-173 28h54m120-10h32M75 239h49" />
        </g>
        <g className="river-ferry-crossing">
          <g className="river-ferry-bob">
            <path d="M-17 218h22m-32 5h26" stroke="#b8cfc6" strokeLinecap="round" />
            <path d="M0 205h83l-13 15H14z" fill="#386b5b" />
            <path d="M12 185h50l8 20H12z" fill="#fcfaf3" stroke="#78938b" strokeWidth="1.5" />
            <path d="M7 184h57" stroke="#ca8c38" strokeWidth="4" strokeLinecap="round" />
            <path d="M18 191h9v8h-9zm15 0h9v8h-9zm15 0h9v8h-9z" fill="#a9c5be" />
            <path d="M26 182v-9m0 0h15l-5 6H26" stroke="#78938b" strokeWidth="1.5" />
            <path d="M10 208h64" stroke="#e5be72" strokeWidth="2" />
          </g>
        </g>
        <g stroke="#a5b4a7" strokeWidth="1.5" strokeLinecap="round"><path d="M238 70q5-6 10 0 5-6 10 0m-37 13q4-4 8 0 4-4 8 0" /></g>
      </svg>

    </div>
  );
}
