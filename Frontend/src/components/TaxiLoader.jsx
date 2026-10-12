import './TaxiLoader.css';

export default function TaxiLoader({ label }) {
  return (
    <div className="taxi-loader" role="status" aria-live="polite">
      <div className="taxi-loading-road" aria-hidden="true">
        <div className="taxi-drive">
          <svg className="taxi-car" viewBox="0 0 240 120" fill="none" focusable="false">
            <ellipse cx="120" cy="108" rx="102" ry="5" fill="#374d40" opacity=".1" />
            <g className="taxi-body">
              {/* Rounded Ambassador silhouette, yellow paint and Kolkata's teal stripe. */}
              <path d="M12 65q1-10 18-12l26-4 25-27q11-11 37-11h24q19 1 29 13l24 29 24 5q12 3 13 14v23H13Z" fill="#efb92f" stroke="#ad7926" strokeWidth="2" />
              <path d="m67 48 20-22q9-8 25-8h14v31Zm68-30h10q13 1 21 12l14 20h-45Z" fill="#b7d7d3" stroke="#806b3f" strokeWidth="2" />
              <path d="m89 27-15 18m21-22-17 23m64-23 17 22" stroke="#e6f3eb" strokeWidth="4" strokeLinecap="round" />
              <path d="m17 60 43-5 131 2 35 8" stroke="#ffe89d" strokeWidth="4" strokeLinecap="round" />
              <path d="M13 67h216v8H13z" fill="#3e9891" />
              <path d="M64 52v36q0 5 5 5h55V53m9 0v40h48V53" stroke="#bf8b2a" strokeWidth="2" />
              <path d="M77 57h13m56 1h13" stroke="#666c59" strokeWidth="3" strokeLinecap="round" />
              <path d="M116 10V5h26v7" fill="#fff1bc" stroke="#ad7926" strokeWidth="1.5" />
              <path d="M181 48h12v7h-12" fill="#536463" />
              <ellipse cx="159" cy="82" rx="9" ry="8" fill="#f8cf55" stroke="#c28c29" />
              <path d="m155 82 3 3 5-6" stroke="#8d692f" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 87h16q3-16 22-16t24 24h87q3-24 23-24t25 24h17" fill="#e0a628" />
              <rect x="224" y="73" width="8" height="12" rx="3" fill="#fff4c8" stroke="#ad7926" />
              <rect x="12" y="74" width="5" height="9" rx="2" fill="#c36641" />
              <path d="M8 94h23m185 0h18" stroke="#75817a" strokeWidth="6" strokeLinecap="round" />
              <path d="M9 92h20m189 0h15" stroke="#e3e8dc" strokeWidth="2" strokeLinecap="round" />
            </g>
            {[57, 191].map(cx => <g key={cx}>
              <circle cx={cx} cy="95" r="19" fill="#374346" />
              <circle cx={cx} cy="95" r="13" stroke="#77898a" strokeWidth="2" />
              <g className="taxi-wheel" style={{ transformOrigin: `${cx}px 95px` }}>
                <circle cx={cx} cy="95" r="8" fill="#a2b6b3" />
                <path d={`M${cx} 87v16m-8-8h16`} stroke="#556c6c" strokeWidth="2" />
              </g>
            </g>)}
          </svg>
        </div>
      </div>
      <p>{label}</p>
    </div>
  );
}
