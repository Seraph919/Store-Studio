import React, { useState, useMemo, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Printer,
  Compass,
  Ruler,
  Thermometer,
  CircleDot
} from 'lucide-react'

export interface RingSizeItem {
  moroccoSize: number // Moroccan/EU size = circumference in mm
  diameterMm: number
  circumferenceMm: number
  usSize: string
  ukSize: string
  diameterInches: number
  circumferenceInches: number
}

export const RING_SIZES_DATA: RingSizeItem[] = [
  { moroccoSize: 48, diameterMm: 15.28, circumferenceMm: 48.0, usSize: '4 ½', ukSize: 'I ½', diameterInches: 0.601, circumferenceInches: 1.89 },
  { moroccoSize: 49, diameterMm: 15.60, circumferenceMm: 49.0, usSize: '5', ukSize: 'J ½', diameterInches: 0.614, circumferenceInches: 1.93 },
  { moroccoSize: 50, diameterMm: 15.92, circumferenceMm: 50.0, usSize: '5 ¼', ukSize: 'K', diameterInches: 0.627, circumferenceInches: 1.97 },
  { moroccoSize: 51, diameterMm: 16.23, circumferenceMm: 51.0, usSize: '5 ¾', ukSize: 'L', diameterInches: 0.639, circumferenceInches: 2.01 },
  { moroccoSize: 52, diameterMm: 16.55, circumferenceMm: 52.0, usSize: '6', ukSize: 'L ½', diameterInches: 0.652, circumferenceInches: 2.05 },
  { moroccoSize: 53, diameterMm: 16.87, circumferenceMm: 53.0, usSize: '6 ½', ukSize: 'M ½', diameterInches: 0.664, circumferenceInches: 2.09 },
  { moroccoSize: 54, diameterMm: 17.19, circumferenceMm: 54.0, usSize: '6 ¾', ukSize: 'N ½', diameterInches: 0.677, circumferenceInches: 2.13 },
  { moroccoSize: 55, diameterMm: 17.51, circumferenceMm: 55.0, usSize: '7 ¼', ukSize: 'O', diameterInches: 0.689, circumferenceInches: 2.17 },
  { moroccoSize: 56, diameterMm: 17.83, circumferenceMm: 56.0, usSize: '7 ½', ukSize: 'P', diameterInches: 0.702, circumferenceInches: 2.20 },
  { moroccoSize: 57, diameterMm: 18.14, circumferenceMm: 57.0, usSize: '8', ukSize: 'P ½', diameterInches: 0.714, circumferenceInches: 2.24 },
  { moroccoSize: 58, diameterMm: 18.46, circumferenceMm: 58.0, usSize: '8 ¼', ukSize: 'Q ½', diameterInches: 0.727, circumferenceInches: 2.28 },
  { moroccoSize: 59, diameterMm: 18.78, circumferenceMm: 59.0, usSize: '8 ¾', ukSize: 'R', diameterInches: 0.739, circumferenceInches: 2.32 },
  { moroccoSize: 60, diameterMm: 19.10, circumferenceMm: 60.0, usSize: '9', ukSize: 'S', diameterInches: 0.752, circumferenceInches: 2.36 },
  { moroccoSize: 61, diameterMm: 19.42, circumferenceMm: 61.0, usSize: '9 ½', ukSize: 'S ½', diameterInches: 0.764, circumferenceInches: 2.40 },
  { moroccoSize: 62, diameterMm: 19.74, circumferenceMm: 62.0, usSize: '10', ukSize: 'T ½', diameterInches: 0.777, circumferenceInches: 2.44 },
  { moroccoSize: 63, diameterMm: 20.05, circumferenceMm: 63.0, usSize: '10 ¼', ukSize: 'U', diameterInches: 0.789, circumferenceInches: 2.48 },
  { moroccoSize: 64, diameterMm: 20.37, circumferenceMm: 64.0, usSize: '10 ¾', ukSize: 'V', diameterInches: 0.802, circumferenceInches: 2.52 },
  { moroccoSize: 65, diameterMm: 20.69, circumferenceMm: 65.0, usSize: '11', ukSize: 'V ½', diameterInches: 0.815, circumferenceInches: 2.56 },
  { moroccoSize: 66, diameterMm: 21.01, circumferenceMm: 66.0, usSize: '11 ½', ukSize: 'W ½', diameterInches: 0.827, circumferenceInches: 2.60 },
  { moroccoSize: 67, diameterMm: 21.33, circumferenceMm: 67.0, usSize: '12', ukSize: 'X ½', diameterInches: 0.840, circumferenceInches: 2.64 },
  { moroccoSize: 68, diameterMm: 21.65, circumferenceMm: 68.0, usSize: '12 ½', ukSize: 'Y', diameterInches: 0.852, circumferenceInches: 2.68 },
]

const QUICK_SIZES = [50, 52, 54, 56, 58, 60, 62]

interface RingSizeGuideProps {
  onBackToStore?: () => void
  storeName?: string
  supportEmail?: string
}

export const RingSizeGuide: React.FC<RingSizeGuideProps> = ({
  onBackToStore,
  storeName,
  supportEmail,
}) => {
  // Calculator State
  const [calcMode, setCalcMode] = useState<'circumference' | 'diameter'>('circumference')
  const [calcValue, setCalcValue] = useState<number>(54.0) // default 54mm (Size 54)
  const [unitSystem, setUnitSystem] = useState<'mm' | 'in'>('mm')
  const tableRef = useRef<HTMLDivElement>(null)

  // Find closest matching ring size
  const closestMatch = useMemo(() => {
    let closest = RING_SIZES_DATA[0]
    let minDiff = Infinity

    for (const item of RING_SIZES_DATA) {
      const metric = calcMode === 'circumference' ? item.circumferenceMm : item.diameterMm
      const diff = Math.abs(metric - calcValue)
      if (diff < minDiff) {
        minDiff = diff
        closest = item
      }
    }
    return closest
  }, [calcMode, calcValue])

  const handleSelectRow = (item: RingSizeItem) => {
    if (calcMode === 'circumference') {
      setCalcValue(item.circumferenceMm)
    } else {
      setCalcValue(item.diameterMm)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="rsg-luxury-wrapper">
      {/* 1. Subtle Breadcrumb & Back Bar */}
      <div className="rsg-top-bar no-print">
        <button
          type="button"
          className="rsg-back-link"
          onClick={onBackToStore}
          aria-label="Return to store"
        >
          <ArrowLeft size={14} />
          <span>Back to store</span>
        </button>

        <div className="rsg-breadcrumbs">
          <span>{storeName || 'Store'}</span>
          <span className="rsg-bc-sep">/</span>
          <span>Store Guide</span>
          <span className="rsg-bc-sep">/</span>
          <span className="rsg-bc-active">Ring Size Guide</span>
        </div>
      </div>

      {/* 2. Decorated Hero Header (Centered & Minimalist) */}
      <header className="rsg-hero-header no-print">
        <div className="rsg-ornament">
          <span className="rsg-ornament-line" />
          <span className="rsg-ornament-diamond">✦</span>
          <span className="rsg-ornament-line right" />
        </div>
        <span className="rsg-kicker">RING SIZE GUIDE</span>
        <h1 className="rsg-hero-title">Find Your Perfect Ring Size</h1>
        <p className="rsg-hero-subtitle">
          In Morocco, ring sizes use millimeters (mm). For example, Size 52 means 52 mm around your finger.
        </p>
      </header>

      {/* 3. Interactive Sizing Calculator Card */}
      <section className="rsg-calc-card no-print">
        <div className="rsg-calc-card-header">
          <div className="rsg-calc-badge">
            <Compass size={14} />
            <span>Ring Size Calculator</span>
          </div>

          <div className="rsg-calc-tabs">
            <button
              type="button"
              className={`rsg-calc-tab ${calcMode === 'circumference' ? 'active' : ''}`}
              onClick={() => {
                setCalcMode('circumference')
                setCalcValue(54.0)
              }}
            >
              Finger Circumference (mm)
            </button>
            <button
              type="button"
              className={`rsg-calc-tab ${calcMode === 'diameter' ? 'active' : ''}`}
              onClick={() => {
                setCalcMode('diameter')
                setCalcValue(17.2)
              }}
            >
              Ring Inside Diameter (mm)
            </button>
          </div>
        </div>

        <div className="rsg-calc-card-body">
          {/* Left Column: Input Slider & Quick Pick */}
          <div className="rsg-calc-controls-col">
            <div className="rsg-measure-readout-row">
              <span className="rsg-readout-label">
                {calcMode === 'circumference' ? 'Measured Finger Circumference' : 'Measured Inside Diameter'}
              </span>
              <div className="rsg-readout-num-wrap">
                <span className="rsg-readout-num">{calcValue.toFixed(1)}</span>
                <span className="rsg-readout-unit">mm</span>
              </div>
            </div>

            <div className="rsg-range-box">
              <input
                type="range"
                min={calcMode === 'circumference' ? 47.0 : 15.0}
                max={calcMode === 'circumference' ? 69.0 : 22.0}
                step={0.1}
                value={calcValue}
                onChange={(e) => setCalcValue(parseFloat(e.target.value))}
                className="rsg-gold-range"
                aria-label="Measurement slider"
              />
              <div className="rsg-range-bounds">
                <span>{calcMode === 'circumference' ? '47.0 mm (Size 47)' : '15.0 mm'}</span>
                <span>{calcMode === 'circumference' ? '69.0 mm (Size 69)' : '22.0 mm'}</span>
              </div>
            </div>

            <div className="rsg-quick-select-row">
              <span className="rsg-quick-label">Popular Moroccan Sizes:</span>
              <div className="rsg-quick-chips">
                {QUICK_SIZES.map((sz) => {
                  const item = RING_SIZES_DATA.find((r) => r.moroccoSize === sz)
                  if (!item) return null
                  const targetVal = calcMode === 'circumference' ? item.circumferenceMm : item.diameterMm
                  const isActive = closestMatch.moroccoSize === sz
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`rsg-quick-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setCalcValue(targetVal)}
                    >
                      {sz}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Recommended Fit Preview */}
          <div className="rsg-calc-result-col">
            <span className="rsg-result-eyebrow">YOUR RECOMMENDED SIZE</span>
            <div className="rsg-result-size-box">
              <span className="rsg-result-number">{closestMatch.moroccoSize}</span>
              <span className="rsg-result-nation">Moroccan Size</span>
            </div>

            <div className="rsg-conversions-strip">
              <div className="rsg-conv-item">
                <span className="rsg-conv-lbl">US Size</span>
                <span className="rsg-conv-val">{closestMatch.usSize}</span>
              </div>
              <div className="rsg-conv-sep" />
              <div className="rsg-conv-item">
                <span className="rsg-conv-lbl">UK Size</span>
                <span className="rsg-conv-val">{closestMatch.ukSize}</span>
              </div>
              <div className="rsg-conv-sep" />
              <div className="rsg-conv-item">
                <span className="rsg-conv-lbl">Diameter</span>
                <span className="rsg-conv-val">{closestMatch.diameterMm.toFixed(1)} mm</span>
              </div>
            </div>

            {/* Live Delicate Ring Silhouette */}
            <div className="rsg-silhouette-preview">
              <div
                className="rsg-silhouette-ring"
                style={{
                  width: `${Math.min(96, Math.max(54, closestMatch.diameterMm * 3.6))}px`,
                  height: `${Math.min(96, Math.max(54, closestMatch.diameterMm * 3.6))}px`,
                }}
              >
                <div className="rsg-silhouette-line" />
                <span className="rsg-silhouette-txt">{closestMatch.diameterMm.toFixed(1)} mm</span>
              </div>
            </div>

            <button
              type="button"
              className="rsg-acquire-cta"
              onClick={() => {
                if (onBackToStore) onBackToStore()
              }}
            >
              <span>Browse the collection</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Two Classical Measurement Protocols (Balanced Side-by-Side) */}
      <section className="rsg-methods-section no-print">
        <div className="rsg-section-header">
          <span className="rsg-section-kicker">EASY SIZING</span>
          <h2 className="rsg-section-title">Two Ways to Measure</h2>
          <p className="rsg-section-sub">
            Follow these simple steps to measure your ring size easily at home.
          </p>
        </div>

        <div className="rsg-methods-grid">
          {/* Method 1: Existing Ring */}
          <div className="rsg-method-card">
            <div className="rsg-method-icon-box">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
                <line x1="6" y1="14" x2="22" y2="14" stroke="var(--color-cta)" strokeWidth="1.8" strokeDasharray="2 2" />
                <polyline points="9,11 5.5,14 9,17" stroke="var(--color-cta)" strokeWidth="1.6" strokeLinecap="round" />
                <polyline points="19,11 22.5,14 19,17" stroke="var(--color-cta)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="rsg-method-badge">METHOD A</span>
            <h3 className="rsg-method-title">Measure an Existing Ring</h3>
            <p className="rsg-method-desc">
              Best if you already have a ring that fits comfortably.
            </p>

            <ol className="rsg-method-steps">
              <li>
                <strong>Select a fitting ring:</strong> Choose a ring that comfortably fits the intended finger.
              </li>
              <li>
                <strong>Measure inside diameter:</strong> Place against a ruler and measure inside edge to inside edge (exclude the metal thickness).
              </li>
              <li>
                <strong>Match to Moroccan chart:</strong> Read the diameter in millimeters to find your size below.
              </li>
            </ol>
          </div>

          {/* Method 2: Finger Measurement */}
          <div className="rsg-method-card">
            <div className="rsg-method-icon-box">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 19C9 14 11 11 14 11C17 11 19 14 21 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="14" cy="14" rx="8" ry="4" stroke="var(--color-cta)" strokeWidth="1.8" strokeDasharray="2 2" />
                <circle cx="14" cy="10" r="2" fill="var(--color-cta)" />
              </svg>
            </div>
            <span className="rsg-method-badge">METHOD B</span>
            <h3 className="rsg-method-title">Measure Your Finger</h3>
            <p className="rsg-method-desc">
              Direct measurement using a strip of paper or string at home.
            </p>

            <ol className="rsg-method-steps">
              <li>
                <strong>Wrap around finger base:</strong> Wrap a strip of paper or ribbon snug around the base of your finger.
              </li>
              <li>
                <strong>Mark the overlap point:</strong> Ensure it slides easily over your knuckle, then mark with a fine pen.
              </li>
              <li>
                <strong>Measure the strip:</strong> Measure against a ruler in millimeters. This length is your Moroccan size.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Sizing Advisory Cards (3 Minimalist Horizontal Blocks) */}
      <section className="rsg-advisory-section no-print">
        <div className="rsg-advisory-grid">
          <div className="rsg-advice-card">
            <div className="rsg-advice-icon"><Thermometer size={18} /></div>
            <h4 className="rsg-advice-title">Temperature &amp; Time</h4>
            <p className="rsg-advice-text">
              Fingers contract in cold weather and expand in heat. We recommend measuring in late afternoon at room temperature.
            </p>
          </div>

          <div className="rsg-advice-card">
            <div className="rsg-advice-icon"><Sparkles size={18} /></div>
            <h4 className="rsg-advice-title">Wide Bands (&gt;4mm)</h4>
            <p className="rsg-advice-text">
              Bands exceeding 4 mm or multi-ring stacking ensembles fit tighter. Select one size larger than your normal size.
            </p>
          </div>

          <div className="rsg-advice-card">
            <div className="rsg-advice-icon"><Ruler size={18} /></div>
            <h4 className="rsg-advice-title">The Knuckle Test</h4>
            <p className="rsg-advice-text">
              If your knuckle is noticeably wider than your finger base, choose a size halfway between the two measurements.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Moroccan & International Conversion Table */}
      <section className="rsg-table-section no-print" ref={tableRef}>
        <div className="rsg-table-card">
          <div className="rsg-table-toolbar">
            <div className="rsg-table-headings">
              <h2 className="rsg-table-title">Moroccan &amp; International Size Chart</h2>
              <p className="rsg-table-sub">Click any row to test in the interactive calculator above</p>
            </div>

            <div className="rsg-table-controls">
              <div className="rsg-unit-switch">
                <button
                  type="button"
                  className={`rsg-unit-btn ${unitSystem === 'mm' ? 'active' : ''}`}
                  onClick={() => setUnitSystem('mm')}
                >
                  mm
                </button>
                <button
                  type="button"
                  className={`rsg-unit-btn ${unitSystem === 'in' ? 'active' : ''}`}
                  onClick={() => setUnitSystem('in')}
                >
                  inches
                </button>
              </div>

              <button
                type="button"
                className="rsg-print-action-btn"
                onClick={handlePrint}
                title="Print calibrated 1:1 scale guide"
              >
                <Printer size={14} />
                <span>Print Guide</span>
              </button>
            </div>
          </div>

          <div className="rsg-table-scroll-container">
            <table className="rsg-table">
              <thead>
                <tr>
                  <th className="th-morocco">Morocco / EU Size</th>
                  <th>Inside Diameter ({unitSystem})</th>
                  <th>Circumference ({unitSystem})</th>
                  <th>US Size</th>
                  <th>UK Size</th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES_DATA.map((item) => {
                  const isSelected = closestMatch.moroccoSize === item.moroccoSize
                  const diameter = unitSystem === 'mm' ? `${item.diameterMm.toFixed(1)} mm` : `${item.diameterInches.toFixed(3)}"`
                  const circum = unitSystem === 'mm' ? `${item.circumferenceMm.toFixed(1)} mm` : `${item.circumferenceInches.toFixed(2)}"`

                  return (
                    <tr
                      key={item.moroccoSize}
                      className={`rsg-table-row ${isSelected ? 'row-active' : ''}`}
                      onClick={() => handleSelectRow(item)}
                    >
                      <td className="td-morocco">
                        <span className="rsg-size-pill">
                          {isSelected && <CircleDot size={11} className="text-gold" />}
                          Size {item.moroccoSize}
                        </span>
                      </td>
                      <td>{diameter}</td>
                      <td>{circum}</td>
                      <td>{item.usSize}</td>
                      <td>{item.ukSize}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Consultation Footer Card */}
      <section className="rsg-concierge-card no-print">
        <span className="rsg-concierge-kicker">NEED HELP WITH SIZING?</span>
        <h3 className="rsg-concierge-title">Need help choosing a ring size?</h3>
        <p className="rsg-concierge-desc">
          If your measurement falls between sizes, ask the seller which size to order before buying.
        </p>
        <div className="rsg-concierge-buttons">
          {supportEmail && (
            <a className="btn-luxury-secondary" href={`mailto:${supportEmail}?subject=Ring%20Sizing%20Assistance`}>
              <span>Contact support</span>
            </a>
          )}
          <button
            type="button"
            className="btn-luxury-cta"
            onClick={onBackToStore}
          >
            <span>Back to store</span>
          </button>
        </div>
      </section>

      {/* 8. Printable 1:1 Scale Sheet (@media print only) */}
      <section className="rsg-print-sheet">
        <div className="rsg-print-header">
          <div className="rsg-print-logo">{storeName || 'Ring Size Guide'}</div>
          <h2 className="rsg-print-title">Printable Ring Sizing Guide</h2>
          <p className="rsg-print-desc">
            IMPORTANT: Ensure your printer scale is set to "100%" or "Actual Size" (Do not select "Fit to Page").
          </p>

          <div className="rsg-calibration-box">
            <div className="rsg-calibration-bar" style={{ width: '50mm' }}>
              <div className="calib-tick calib-0" />
              <div className="calib-tick calib-10" />
              <div className="calib-tick calib-20" />
              <div className="calib-tick calib-30" />
              <div className="calib-tick calib-40" />
              <div className="calib-tick calib-50" />
              <span className="calib-label">50 mm Metric Verification Bar</span>
            </div>
            <span className="calib-note">
              Place a standard metric ruler or credit card against this bar. If it measures exactly 50 mm, scale is 100% accurate.
            </span>
          </div>
        </div>

        <div className="rsg-print-grid">
          {RING_SIZES_DATA.map((item) => (
            <div key={item.moroccoSize} className="rsg-print-cell">
              <div
                className="rsg-print-circle"
                style={{
                  width: `${item.diameterMm}mm`,
                  height: `${item.diameterMm}mm`,
                }}
              >
                <span className="rsg-print-sz-num">{item.moroccoSize}</span>
                <span className="rsg-print-dm-num">{item.diameterMm.toFixed(1)} mm</span>
              </div>
              <div className="rsg-print-legend">
                US {item.usSize} • UK {item.ukSize}
              </div>
            </div>
          ))}
        </div>

        <div className="rsg-print-footer">
          <p>{storeName || 'Store'}{supportEmail ? ` • ${supportEmail}` : ''}</p>
        </div>
      </section>
    </div>
  )
}

export default RingSizeGuide
