/** Choose readable foreground text for a configured store accent (WCAG relative luminance). */
export function accentForeground(accent: string): '#FFFFFF' | '#0F172A' {
  const hex = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent.slice(1) : '4338CA'
  const rgb = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
  const linear = rgb.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
  return luminance > 0.179 ? '#0F172A' : '#FFFFFF'
}
