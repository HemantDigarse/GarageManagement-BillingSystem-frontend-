export const currency = (value) => {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
}
