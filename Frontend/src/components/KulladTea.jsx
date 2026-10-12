import { useId } from 'react';

export default function KulladTea() {
  const id = useId();
  return (
    <svg className="kullad-tea" viewBox="0 0 80 100" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-clay`} x1="16" y1="55" x2="67" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b65a30" /><stop offset=".28" stopColor="#d88b50" /><stop offset=".65" stopColor="#b15a32" /><stop offset="1" stopColor="#8b3e24" />
        </linearGradient>
        <linearGradient id={`${id}-chai`} x1="40" y1="43" x2="40" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b77c42" /><stop offset="1" stopColor="#edd09a" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="93" rx="24" ry="4" fill="#714023" opacity=".13" />
      <g className="tea-steam" stroke="#a68e79" strokeWidth="2" strokeLinecap="round">
        <path className="tea-steam-wisp tea-steam-one" d="M29 37c-9-8 8-11 0-20" />
        <path className="tea-steam-wisp tea-steam-two" d="M40 33c-9-9 9-13 1-24" />
        <path className="tea-steam-wisp tea-steam-three" d="M51 37c-7-7 8-10 2-18" />
      </g>
      <path d="M14 48 22 85q2 9 18 9t18-9l8-37Z" fill={`url(#${id}-clay)`} stroke="#9b4e2e" strokeWidth="1.5" />
      <g stroke="#e5a269" strokeWidth="2" strokeLinecap="round" opacity=".48">
        <path d="m23 62 5 22m3-20 3 24m7-24v25m8-25-3 24m12-26-5 23" />
      </g>
      <path d="M18 61q22 9 44 0" stroke="#934222" strokeWidth="2" opacity=".35" />
      <ellipse cx="40" cy="48" rx="26" ry="10" fill="#d98e57" stroke="#a85e36" strokeWidth="1.5" />
      <ellipse cx="40" cy="48" rx="22" ry="7" fill={`url(#${id}-chai)`} />
      <path d="M21 49q17 8 37 0" stroke="#f5ddb1" strokeWidth="2" strokeLinecap="round" />
      <g fill="#f9e5bb" opacity=".9"><circle cx="23" cy="47" r="1.2" /><circle cx="27" cy="50" r="1.5" /><circle cx="32" cy="51" r="1" /><circle cx="52" cy="49" r="1.4" /><circle cx="56" cy="47" r="1" /></g>
      <path d="M23 87q17 9 34-1" stroke="#7b361f" strokeWidth="2" opacity=".4" />
    </svg>
  );
}
