// Deterministic layout for the falling 3D coins (same every render, no Math.random)
export function makeCoins(count = 22) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: ((i * 37 + 5) % 94) + 2,
    size: 30 + ((i * 17) % 46),
    fall: 6 + ((i * 5) % 7),
    delay: -(i * 0.95),
    spin: 1.8 + (i % 5) * 0.55,
    tilt: ((i * 29) % 56) - 28,
    sway: 3 + (i % 4),
    drift: 8 + ((i * 7) % 16),
    layer: i % 3 === 0 ? 'back' : 'front'
  }))
}
