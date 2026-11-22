"use client";

/* Official logo chips, nf-metro file-type documents, and custom glyphs.
   No typographic grey letter tiles. */

export const TILE = "#f4f4f1";
export const TILE_STROKE = "#d8d8d4";

export function badgeSize(spec, compact) {
  if (!spec) return { w: 16, h: 16 };
  const k = compact ? 0.68 : 1;
  if (spec.file) return { w: Math.round(30 * k), h: Math.round(38 * k) };
  if (spec.glyph) return { w: Math.round(46 * k), h: Math.round(46 * k) };
  if (spec.extra) return { w: Math.round((spec.chipW || 180) * k), h: Math.round(44 * k) };
  if (spec.xl) return { w: Math.round(140 * k), h: Math.round(42 * k) };
  if (spec.wide) return { w: Math.round(96 * k), h: Math.round(44 * k) };
  return { w: Math.round(52 * k), h: Math.round(44 * k) };
}

function FileDoc({ w, h, tag, color, compact, stroke, strokeWidth }) {
  const fold = compact ? 7 : 9;
  const rx = compact ? 2.2 : 2.8;
  const tagH = compact ? 9 : 11;
  const tagW = Math.min(w - 6, Math.max(22, tag.length * (compact ? 5.2 : 6.2) + 6));
  const fs = tag.length > 4 ? (compact ? 6 : 7.2) : (compact ? 6.5 : 8);
  return (
    <g>
      <path
        d={`M1.5  ${rx + 1.2}
            A${rx} ${rx} 0 0 1 ${rx + 1.5} 1.2
            H${w - fold - 1}
            L${w - 1.5} ${fold + 1.2}
            V${h - rx - 1}
            A${rx} ${rx} 0 0 1 ${w - rx - 1.5} ${h - 1}
            H${rx + 1.5}
            A${rx} ${rx} 0 0 1 1.5 ${h - rx - 1}
            Z`}
        fill="#fff"
        stroke={stroke || "#cfcfc8"}
        strokeWidth={strokeWidth || 0.9}
      />
      <path
        d={`M${w - fold - 1} 1.2 V${fold + 1.2} H${w - 1.5} Z`}
        fill="#ecece6"
        stroke="#cfcfc8"
        strokeWidth="0.8"
      />
      <rect x={(w - tagW) / 2} y={compact ? 14 : 16} width={tagW} height={tagH} rx="1.6" fill={color} />
      <text
        x={w / 2}
        y={(compact ? 14 : 16) + tagH * 0.72}
        textAnchor="middle"
        fill="#fff"
        fontSize={fs}
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        {tag}
      </text>
    </g>
  );
}

function Glyph({ kind, s }) {
  const ink = "#1a1a1a";
  const teal = "#128C7A";
  const purple = "#6B4E8A";
  const gold = "#C48A2A";
  const rose = "#B04A6A";
  const mid = s / 2;
  switch (kind) {
    case "qc":
      return (
        <g fill="none" stroke={teal} strokeWidth={s * 0.07} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${mid} ${s * 0.14} L${s * 0.82} ${s * 0.28} V${s * 0.52} C${s * 0.82} ${s * 0.74} ${mid} ${s * 0.88} ${mid} ${s * 0.88} C${mid} ${s * 0.88} ${s * 0.18} ${s * 0.74} ${s * 0.18} ${s * 0.52} V${s * 0.28} Z`} fill="rgba(18,140,122,0.12)" />
          <path d={`M${s * 0.32} ${s * 0.52} L${s * 0.46} ${s * 0.66} L${s * 0.72} ${s * 0.36}`} />
        </g>
      );
    case "umap":
      return (
        <g>
          <circle cx={s * 0.32} cy={s * 0.38} r={s * 0.055} fill={teal} />
          <circle cx={s * 0.42} cy={s * 0.28} r={s * 0.045} fill={teal} />
          <circle cx={s * 0.28} cy={s * 0.50} r={s * 0.04} fill={teal} />
          <circle cx={s * 0.68} cy={s * 0.36} r={s * 0.055} fill={purple} />
          <circle cx={s * 0.74} cy={s * 0.48} r={s * 0.04} fill={purple} />
          <circle cx={s * 0.60} cy={s * 0.44} r={s * 0.035} fill={purple} />
          <circle cx={s * 0.48} cy={s * 0.70} r={s * 0.05} fill={gold} />
          <circle cx={s * 0.38} cy={s * 0.74} r={s * 0.035} fill={gold} />
          <circle cx={s * 0.58} cy={s * 0.76} r={s * 0.04} fill={gold} />
          <circle cx={s * 0.54} cy={s * 0.62} r={s * 0.03} fill={gold} />
        </g>
      );
    case "banksy":
      return (
        <g fill="none" stroke={teal} strokeWidth={s * 0.045}>
          <ellipse cx={mid} cy={mid} rx={s * 0.34} ry={s * 0.28} fill="rgba(18,140,122,0.08)" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const x = s * (0.28 + c * 0.15 + (r % 2 ? 0.07 : 0));
              const y = s * (0.30 + r * 0.18);
              return <circle key={`${r}-${c}`} cx={x} cy={y} r={s * 0.045} fill={r === 1 && c === 1 ? teal : "#fff"} stroke={teal} />;
            })
          )}
        </g>
      );
    case "fetch":
      return (
        <g fill="none" stroke={ink} strokeWidth={s * 0.07} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${s * 0.32} ${s * 0.42} V${s * 0.18} H${s * 0.68} V${s * 0.42}`} />
          <path d={`M${mid} ${s * 0.22} V${s * 0.62}`} />
          <path d={`M${s * 0.36} ${s * 0.48} L${mid} ${s * 0.64} L${s * 0.64} ${s * 0.48}`} />
          <path d={`M${s * 0.22} ${s * 0.72} L${s * 0.28} ${s * 0.84} H${s * 0.72} L${s * 0.78} ${s * 0.72}`} />
        </g>
      );
    case "pipeline":
      return (
        <g fill="none" stroke={ink} strokeWidth={s * 0.065} strokeLinecap="round">
          <circle cx={s * 0.28} cy={s * 0.32} r={s * 0.09} fill="#fff" />
          <circle cx={s * 0.70} cy={s * 0.32} r={s * 0.09} fill="#fff" />
          <circle cx={mid} cy={s * 0.70} r={s * 0.09} fill="#fff" />
          <path d={`M${s * 0.37} ${s * 0.32} H${s * 0.61}`} />
          <path d={`M${s * 0.32} ${s * 0.41} L${s * 0.44} ${s * 0.62}`} />
          <path d={`M${s * 0.68} ${s * 0.41} L${s * 0.56} ${s * 0.62}`} />
        </g>
      );
    case "ontology":
      return (
        <g fill="none" stroke={ink} strokeWidth={s * 0.065} strokeLinecap="round">
          <circle cx={mid} cy={s * 0.22} r={s * 0.08} fill="#fff" />
          <circle cx={s * 0.28} cy={s * 0.52} r={s * 0.075} fill="#fff" />
          <circle cx={s * 0.72} cy={s * 0.52} r={s * 0.075} fill="#fff" />
          <circle cx={s * 0.20} cy={s * 0.80} r={s * 0.06} fill="#fff" />
          <circle cx={s * 0.38} cy={s * 0.80} r={s * 0.06} fill="#fff" />
          <circle cx={s * 0.72} cy={s * 0.80} r={s * 0.06} fill="#fff" />
          <path d={`M${mid} ${s * 0.30} V${s * 0.38} H${s * 0.28} V${s * 0.44}`} />
          <path d={`M${mid} ${s * 0.38} H${s * 0.72} V${s * 0.44}`} />
          <path d={`M${s * 0.28} ${s * 0.60} V${s * 0.66} H${s * 0.20} V${s * 0.74}`} />
          <path d={`M${s * 0.28} ${s * 0.66} H${s * 0.38} V${s * 0.74}`} />
          <path d={`M${s * 0.72} ${s * 0.60} V${s * 0.74}`} />
        </g>
      );
    case "norm":
      return (
        <g fill="none" stroke={ink} strokeWidth={s * 0.07} strokeLinecap="round">
          <path d={`M${s * 0.18} ${s * 0.72} C${s * 0.28} ${s * 0.72} ${s * 0.32} ${s * 0.22} ${s * 0.42} ${s * 0.22} C${s * 0.52} ${s * 0.22} ${s * 0.54} ${s * 0.72} ${s * 0.64} ${s * 0.72}`} stroke={teal} />
          <path d={`M${s * 0.28} ${s * 0.72} C${s * 0.40} ${s * 0.72} ${s * 0.46} ${s * 0.36} ${s * 0.58} ${s * 0.36} C${s * 0.70} ${s * 0.36} ${s * 0.74} ${s * 0.72} ${s * 0.84} ${s * 0.72}`} stroke={purple} />
          <path d={`M${s * 0.16} ${s * 0.78} H${s * 0.84}`} />
        </g>
      );
    case "de":
      return (
        <g>
          <path d={`M${s * 0.18} ${s * 0.82} H${s * 0.82}`} stroke={ink} strokeWidth={s * 0.05} fill="none" />
          <path d={`M${mid} ${s * 0.82} V${s * 0.16}`} stroke={ink} strokeWidth={s * 0.05} fill="none" />
          <circle cx={s * 0.38} cy={s * 0.62} r={s * 0.04} fill={ink} opacity="0.5" />
          <circle cx={s * 0.44} cy={s * 0.58} r={s * 0.035} fill={ink} opacity="0.5" />
          <circle cx={s * 0.56} cy={s * 0.60} r={s * 0.035} fill={ink} opacity="0.5" />
          <circle cx={s * 0.62} cy={s * 0.64} r={s * 0.03} fill={ink} opacity="0.45" />
          <circle cx={s * 0.34} cy={s * 0.36} r={s * 0.05} fill={rose} />
          <circle cx={s * 0.70} cy={s * 0.28} r={s * 0.055} fill={teal} />
        </g>
      );
    case "annotate":
      return (
        <g fill="none" stroke={ink} strokeWidth={s * 0.065} strokeLinecap="round">
          <circle cx={s * 0.40} cy={s * 0.52} r={s * 0.22} fill="rgba(18,140,122,0.10)" stroke={teal} />
          <circle cx={s * 0.40} cy={s * 0.52} r={s * 0.07} fill={teal} stroke="none" />
          <rect x={s * 0.58} y={s * 0.22} width={s * 0.26} height={s * 0.20} rx={s * 0.03} fill="#fff" />
          <path d={`M${s * 0.64} ${s * 0.30} H${s * 0.78}`} />
          <path d={`M${s * 0.64} ${s * 0.36} H${s * 0.74}`} />
        </g>
      );
    case "pathway":
      return (
        <g fill="none" stroke={rose} strokeWidth={s * 0.065} strokeLinecap="round">
          <circle cx={s * 0.28} cy={s * 0.30} r={s * 0.08} fill="#fff" />
          <circle cx={s * 0.70} cy={s * 0.30} r={s * 0.08} fill="#fff" />
          <circle cx={s * 0.28} cy={s * 0.70} r={s * 0.08} fill="#fff" />
          <circle cx={s * 0.70} cy={s * 0.70} r={s * 0.08} fill="#fff" />
          <path d={`M${s * 0.36} ${s * 0.30} H${s * 0.62}`} />
          <path d={`M${s * 0.28} ${s * 0.38} V${s * 0.62}`} />
          <path d={`M${s * 0.36} ${s * 0.66} L${s * 0.62} ${s * 0.36}`} />
          <path d={`M${s * 0.70} ${s * 0.38} V${s * 0.62}`} />
        </g>
      );
    default:
      return null;
  }
}

export function LogoBadge({ x, y, spec, lit, pulse, compact }) {
  const { w, h } = badgeSize(spec, compact);
  const pad = compact ? 4 : 6;
  const extraFrac = spec.extraFrac == null ? 0.68 : spec.extraFrac;
  const split = w - pad * 2 - 6;
  const innerW = spec.extra ? split * (1 - extraFrac) : w - pad * 2;
  const extraW = split * extraFrac;
  const lift = pulse ? (compact ? -2 : -4) : 0;
  const glow = pulse
    ? "drop-shadow(0 0 8px rgba(43,181,160,0.65))"
    : lit
      ? "drop-shadow(0 1px 3px rgba(43,181,160,0.28))"
      : "none";
  const stroke = pulse || lit ? "#2BB5A0" : (spec.accent ? "#2BB5A0" : TILE_STROKE);
  const sw = pulse ? 2.2 : lit || spec.accent ? 1.6 : 0.9;
  return (
    <g
      transform={`translate(${x - w / 2}, ${y - h / 2 + lift})`}
      style={{ filter: glow, transition: "transform 280ms ease, filter 280ms ease" }}
    >
      {spec.file ? (
        <FileDoc
          w={w}
          h={h}
          tag={spec.file}
          color={spec.fileColor || "#3D8C6E"}
          compact={compact}
          stroke={stroke}
          strokeWidth={sw}
        />
      ) : (
        <>
          <rect width={w} height={h} rx={compact ? 6 : 8} fill={TILE} stroke={stroke} strokeWidth={sw} />
          {spec.glyph && (
            <g transform={`translate(${pad}, ${pad})`}>
              <Glyph kind={spec.glyph} s={Math.min(w, h) - pad * 2} />
            </g>
          )}
          {spec.src && (
            <image
              href={spec.src}
              x={pad}
              y={pad}
              width={innerW}
              height={h - pad * 2}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
          {spec.extra && (
            <image
              href={spec.extra}
              x={pad + innerW + 6}
              y={pad}
              width={extraW}
              height={h - pad * 2}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
        </>
      )}
    </g>
  );
}
