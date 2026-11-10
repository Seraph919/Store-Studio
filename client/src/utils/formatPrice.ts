export const formatPrice = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0 DH'
  return `${Math.round(val).toLocaleString()} DH`
}

export default formatPrice

