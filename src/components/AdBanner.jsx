/**
 * AdBanner.jsx — 728×90 AdSense placeholder banner
 * Replace the inner content with your actual AdSense / Playwire script tags.
 */
import React from 'react'

export default function AdBanner() {
  return (
    <div
      className="ad-banner flex-shrink-0 w-full flex items-center justify-center"
      style={{ height: '90px', minHeight: '90px', maxWidth: '100vw' }}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* ── Placeholder — replace with AdSense script ── */}
      <div
        className="flex items-center justify-center rounded text-center"
        style={{
          width: '728px',
          maxWidth: '100%',
          height: '72px',
          border: '1px dashed rgba(0,245,255,0.2)',
          background: 'rgba(0,245,255,0.02)',
          color: 'rgba(0,245,255,0.35)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          fontFamily: 'Orbitron, monospace',
        }}
      >
        <span>⬡ ADSENSE BANNER PLACEHOLDER · 728×90 ⬡</span>
      </div>

      {/*
        ── Live AdSense (replace placeholder above with): ──────────────────

        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
        />
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

        ────────────────────────────────────────────────────────────────── */}
    </div>
  )
}
