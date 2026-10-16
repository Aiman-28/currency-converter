import { SAMPLE_RATES } from './currencies'

// [from, to, amount, hours ago] - 20 demo conversions across different currency pairs
const SAMPLES = [
  ['USD', 'PKR', 250, 2], ['EUR', 'USD', 400, 5], ['GBP', 'INR', 120, 9], ['AED', 'PKR', 1000, 14],
  ['CAD', 'AUD', 900, 20], ['SAR', 'PKR', 500, 26], ['USD', 'EUR', 1500, 31], ['JPY', 'USD', 50000, 40],
  ['CNY', 'PKR', 2000, 47], ['CHF', 'EUR', 350, 55], ['AUD', 'NZD', 800, 63], ['USD', 'AED', 640, 70],
  ['GBP', 'USD', 275, 79], ['INR', 'USD', 15000, 88], ['TRY', 'PKR', 3000, 96], ['SGD', 'MYR', 420, 110],
  ['USD', 'SAR', 1200, 125], ['EUR', 'PKR', 180, 140], ['KWD', 'USD', 90, 160], ['USD', 'JPY', 300, 180]
]

export function buildSamples() {
  const now = Date.now()
  return SAMPLES.map(([from, to, amount, hours], i) => {
    const rate = SAMPLE_RATES[to] / SAMPLE_RATES[from]
    return { id: now + i + Math.random(), amount, from, to, rate, result: amount * rate, rateSource: 'sample', timestamp: now - hours * 3600 * 1000 }
  })
}
