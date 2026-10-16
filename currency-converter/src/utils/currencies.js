// [code, name, country code (for flag), SAMPLE rate vs USD]
// Sample rates are DEMONSTRATION data only - used when the live API is unreachable.
const RAW = [
  ['USD', 'US Dollar', 'us', 1], ['EUR', 'Euro', 'eu', 0.92], ['GBP', 'British Pound', 'gb', 0.79],
  ['PKR', 'Pakistani Rupee', 'pk', 278.5], ['INR', 'Indian Rupee', 'in', 83.2], ['CAD', 'Canadian Dollar', 'ca', 1.36],
  ['AUD', 'Australian Dollar', 'au', 1.52], ['AED', 'UAE Dirham', 'ae', 3.6725], ['SAR', 'Saudi Riyal', 'sa', 3.75],
  ['JPY', 'Japanese Yen', 'jp', 149.5], ['CNY', 'Chinese Yuan', 'cn', 7.24], ['CHF', 'Swiss Franc', 'ch', 0.88],
  ['TRY', 'Turkish Lira', 'tr', 33.5], ['SGD', 'Singapore Dollar', 'sg', 1.34], ['MYR', 'Malaysian Ringgit', 'my', 4.47],
  ['BDT', 'Bangladeshi Taka', 'bd', 117], ['LKR', 'Sri Lankan Rupee', 'lk', 300], ['NPR', 'Nepalese Rupee', 'np', 133],
  ['KWD', 'Kuwaiti Dinar', 'kw', 0.307], ['QAR', 'Qatari Riyal', 'qa', 3.64], ['OMR', 'Omani Rial', 'om', 0.385],
  ['BHD', 'Bahraini Dinar', 'bh', 0.376], ['EGP', 'Egyptian Pound', 'eg', 49], ['ZAR', 'South African Rand', 'za', 18.2],
  ['NZD', 'New Zealand Dollar', 'nz', 1.65], ['SEK', 'Swedish Krona', 'se', 10.5], ['NOK', 'Norwegian Krone', 'no', 10.7],
  ['DKK', 'Danish Krone', 'dk', 6.9], ['HKD', 'Hong Kong Dollar', 'hk', 7.8], ['KRW', 'South Korean Won', 'kr', 1350],
  ['THB', 'Thai Baht', 'th', 35], ['IDR', 'Indonesian Rupiah', 'id', 15600], ['PHP', 'Philippine Peso', 'ph', 56]
]

export const CURRENCIES = RAW.map(([code, name, cc]) => ({ code, name, cc }))
export const SAMPLE_RATES = Object.fromEntries(RAW.map((r) => [r[0], r[3]]))
export const API_URL = 'https://open.er-api.com/v6/latest/USD'

export const flagUrl = (code) => {
  const c = CURRENCIES.find((x) => x.code === code)
  return c ? `https://flagcdn.com/${c.cc}.svg` : ''
}

export function currencyName(code) {
  return CURRENCIES.find((c) => c.code === code)?.name || code
}

const SYMBOLS = { PKR: '₨', AED: 'AED', SAR: 'SAR', QAR: 'QAR', OMR: 'OMR', BHD: 'BHD', KWD: 'KWD', BDT: '৳', LKR: 'Rs', NPR: 'Rs' }
const ZERO = ['JPY', 'KRW', 'IDR']
const THREE = ['KWD', 'OMR', 'BHD']

// Currency symbol + the correct number of decimals for each currency
export function formatMoney(amount, code) {
  const digits = ZERO.includes(code) ? 0 : THREE.includes(code) ? 3 : 2
  const opts = { minimumFractionDigits: digits, maximumFractionDigits: digits }
  try {
    if (SYMBOLS[code]) return `${SYMBOLS[code]} ${new Intl.NumberFormat('en-US', opts).format(amount)}`
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, ...opts }).format(amount)
  } catch {
    return `${Number(amount).toFixed(digits)} ${code}`
  }
}

// Exchange rates: enough precision to be meaningful for both big (PKR) and small (KWD) rates
export function formatRate(rate) {
  if (!isFinite(rate)) return '—'
  if (rate >= 100) return rate.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  if (rate >= 1) return rate.toFixed(4)
  return rate.toPrecision(4)
}

export function formatDate(ts) {
  return new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
