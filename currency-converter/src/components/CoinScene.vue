<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { makeCoins } from '../utils/coins'

defineProps({ shy: Boolean })

const coins = makeCoins()
const root = ref(null)
const tilt = ref(null)
const idx = ref(0)
const paused = ref(false)
let timer = null
let layers = {}

const pairs = [
  { from: 'USD', to: 'PKR', amt: '1,000.00', res: '278,500', rate: '278.50' },
  { from: 'EUR', to: 'GBP', amt: '500.00', res: '430.00', rate: '0.86' },
  { from: 'GBP', to: 'INR', amt: '250.00', res: '26,325', rate: '105.30' }
]
const rows = [
  { t: 'USD → PKR', a: '₨ 278,500', c: '#16a34a' },
  { t: 'EUR → USD', a: '$ 541.20', c: '#0ea5e9' },
  { t: 'AUD → CAD', a: 'C$ 912.40', c: '#f59e0b' }
]

/* phone follows the pointer in 3D */
function setTilt(nx, ny) {
  if (tilt.value) tilt.value.style.transform = `rotateX(${8 - ny * 8}deg) rotateY(${-14 + nx * 12}deg) rotateZ(5deg)`
}
function onPointer(x, y) {
  const nx = (x / window.innerWidth - 0.5) * 2
  const ny = (y / window.innerHeight - 0.5) * 2
  setTilt(nx, ny)
  // coin layers drift against the cursor at different depths (parallax)
  if (layers.front) layers.front.style.transform = `translate(${nx * -22}px, ${ny * -10}px)`
  if (layers.back) layers.back.style.transform = `translate(${nx * 10}px, ${ny * 5}px)`
}
const onMove = (e) => onPointer(e.clientX, e.clientY)
const onTouch = (e) => onPointer(e.touches[0].clientX, e.touches[0].clientY)

onMounted(() => {
  layers = { front: root.value.querySelector('.cb-coins.front'), back: root.value.querySelector('.cb-coins.back') }
  root.value.style.setProperty('--travel', root.value.clientHeight + 140 + 'px')
  setTilt(0, 0)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onTouch, { passive: true })
  timer = setInterval(() => (idx.value = (idx.value + 1) % pairs.length), 3200)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('touchmove', onTouch)
  clearInterval(timer)
})
</script>

<template>
  <div ref="root" :class="['coin-banner', { shy, paused }]" aria-hidden="true">
    <div class="cb-glow"></div>

    <div v-for="layer in ['back', 'front']" :key="layer" :class="['cb-coins', layer]">
      <template v-for="c in coins" :key="c.id">
        <div
          v-if="c.layer === layer"
          class="coin"
          :style="{ '--l': c.left + '%', '--s': c.size + 'px', '--fd': c.fall + 's', '--dl': c.delay + 's', '--sd': c.spin + 's', '--tx': c.tilt + 'deg', '--sw': c.sway + 's', '--dr': c.drift + 'px' }"
        >
          <div class="sway"><div class="spin">
            <i class="ce" style="transform: translateZ(-4px)"></i><i class="ce" style="transform: translateZ(-2px)"></i>
            <i class="ce"></i><i class="ce" style="transform: translateZ(2px)"></i><i class="ce" style="transform: translateZ(4px)"></i>
            <b class="cf" style="transform: translateZ(5px)">$</b>
            <b class="cf" style="transform: translateZ(-5px) rotateY(180deg)">$</b>
          </div></div>
        </div>
      </template>
    </div>

    <div class="cb-stage">
      <div class="cb-float">
        <div ref="tilt" class="phone">
          <span class="notch"></span>
          <div class="screen">
            <div class="app-top"><span class="logo-dot"></span><small>CurrencyX</small><span class="avatar"></span></div>
            <small class="lbl">Converted amount</small>
            <Transition name="swap" mode="out-in">
              <div :key="idx" class="conv">
                <div class="big">{{ pairs[idx].res }} <em>{{ pairs[idx].to }}</em></div>
                <small class="sub">{{ pairs[idx].amt }} {{ pairs[idx].from }} · rate {{ pairs[idx].rate }}</small>
              </div>
            </Transition>
            <svg class="spark" viewBox="0 0 160 54" preserveAspectRatio="none">
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c55e" stop-opacity=".35" /><stop offset="1" stop-color="#22c55e" stop-opacity="0" /></linearGradient></defs>
              <path d="M0 42 L20 36 L40 40 L62 26 L84 30 L106 16 L128 22 L160 6 V54 H0Z" fill="url(#sg)" />
              <path class="line" d="M0 42 L20 36 L40 40 L62 26 L84 30 L106 16 L128 22 L160 6" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div v-for="r in rows" :key="r.t" class="row-item"><span class="dot" :style="{ background: r.c }"></span><span>{{ r.t }}</span><b>{{ r.a }}</b></div>
            <div class="nav"><span></span><span></span><span></span><span></span></div>
            <div class="lock"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></svg><span>Secure</span></div>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="cb-pause" :title="paused ? 'Play animation' : 'Pause animation'" @click="paused = !paused">{{ paused ? '▶' : '❚❚' }}</button>

    <div class="cb-copy">
      <p v-if="$slots.default" class="tagline"><slot /></p>
      <p class="caption">Live exchange rates · 10 currencies · instant history</p>
    </div>
  </div>
</template>

<style>
.coin-banner { position: relative; overflow: hidden; min-height: 300px; background: linear-gradient(160deg, #f8fafc 0%, #e9f1ec 100%); }
.cb-glow { position: absolute; inset: 0; background: radial-gradient(55% 45% at 55% 38%, rgba(74, 222, 128, .28), transparent 70%), radial-gradient(40% 30% at 15% 85%, rgba(14, 165, 233, .14), transparent 70%); }

/* ---- 3D coins ---- */
.cb-coins { position: absolute; inset: -20px; perspective: 700px; pointer-events: none; transition: transform .35s ease-out; }
.cb-coins.back { z-index: 1; } .cb-coins.front { z-index: 3; }
.coin { position: absolute; top: -10px; left: var(--l); width: var(--s); height: var(--s); animation: cb-fall var(--fd) linear var(--dl) infinite; }
@keyframes cb-fall { from { transform: translateY(0); opacity: 0; } 6% { opacity: 1; } 94% { opacity: 1; } to { transform: translateY(var(--travel, 780px)); opacity: 0; } }
.coin .sway { width: 100%; height: 100%; transform-style: preserve-3d; animation: cb-sway var(--sw) ease-in-out infinite alternate; }
@keyframes cb-sway { from { transform: translateX(calc(var(--dr) * -1)); } to { transform: translateX(var(--dr)); } }
.coin .spin { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: cb-spin var(--sd) linear infinite; }
@keyframes cb-spin { from { transform: rotateX(var(--tx)) rotateY(0deg); } to { transform: rotateX(var(--tx)) rotateY(360deg); } }
.coin .ce { position: absolute; inset: 0; border-radius: 50%; background: #1d6f1c; }
.coin .cf { position: absolute; inset: 0; border-radius: 50%; display: grid; place-items: center; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background: radial-gradient(circle at 32% 28%, #dcffb8 0, #6fd43d 28%, #2f9e1f 62%, #14661a 100%);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, .2), inset 0 -4px 9px rgba(0, 60, 0, .35);
  font-style: normal; font-weight: 800; font-size: calc(var(--s) * .58); color: #1a7a1c; font-family: Inter, Arial, sans-serif;
  text-shadow: 0 1px 0 rgba(255, 255, 255, .55), 0 -1px 0 rgba(0, 60, 0, .4); }
.coin .cf::before { content: ''; position: absolute; inset: 12%; border-radius: 50%; border: 2px solid rgba(255, 255, 255, .28); }

/* ---- phone ---- */
.cb-stage { position: absolute; left: 50%; top: 39%; z-index: 2; transform: translate(-50%, -50%) scale(var(--ps, 1)); perspective: 1000px; }
.cb-float { animation: cb-float 5s ease-in-out infinite; }
@keyframes cb-float { 50% { transform: translateY(-10px); } }
.phone { position: relative; width: 196px; height: 392px; padding: 8px; border-radius: 34px; background: linear-gradient(145deg, #2b3445, #0b1220);
  box-shadow: 0 30px 50px -20px rgba(15, 23, 42, .55), 0 0 0 1.5px rgba(255, 255, 255, .15) inset; transition: transform .2s ease-out; transform-style: preserve-3d; }
.notch { position: absolute; top: 14px; left: 50%; width: 54px; height: 15px; margin-left: -27px; border-radius: 10px; background: #05080f; z-index: 3; }
.screen { position: relative; height: 100%; border-radius: 27px; background: #fff; padding: 34px 13px 12px; overflow: hidden; font-family: Inter, system-ui, sans-serif; color: #0f172a; }
.app-top { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; }
.app-top small { font-weight: 700; font-size: .62rem; flex: 1; }
.logo-dot { width: 12px; height: 12px; border-radius: 4px; background: linear-gradient(135deg, #22c55e, #16a34a); }
.avatar { width: 14px; height: 14px; border-radius: 50%; background: #e2e8f0; }
.lbl { color: #94a3b8; font-size: .55rem; text-transform: uppercase; letter-spacing: .08em; }
.conv .big { font-size: 1.28rem; font-weight: 800; letter-spacing: -.01em; margin-top: 2px; }
.conv .big em { font-style: normal; font-size: .72rem; color: #16a34a; margin-left: 2px; }
.conv .sub { display: block; color: #64748b; font-size: .58rem; margin-top: 1px; }
.spark { width: 100%; height: 54px; margin: 10px 0 8px; display: block; }
.spark .line { stroke-dasharray: 260; stroke-dashoffset: 260; animation: cb-draw 4.2s ease-in-out infinite; }
@keyframes cb-draw { 0% { stroke-dashoffset: 260; } 55%, 100% { stroke-dashoffset: 0; } }
.row-item { display: flex; align-items: center; gap: 7px; font-size: .6rem; padding: 6px 0; border-top: 1px solid #eef2f6; }
.row-item .dot { width: 9px; height: 9px; border-radius: 50%; } .row-item span:nth-child(2) { flex: 1; color: #475569; } .row-item b { font-weight: 700; }
.nav { position: absolute; left: 10px; right: 10px; bottom: 9px; height: 30px; border-radius: 12px; background: #0f172a; display: flex; justify-content: space-around; align-items: center; }
.nav span { width: 11px; height: 11px; border-radius: 4px; background: rgba(255, 255, 255, .5); } .nav span:first-child { background: #4ade80; }
.lock { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: rgba(255, 255, 255, .93); backdrop-filter: blur(4px);
  font-size: .72rem; font-weight: 700; color: #16a34a; opacity: 0; transform: scale(.96); transition: opacity .3s, transform .3s; pointer-events: none; }
.coin-banner.shy .lock { opacity: 1; transform: none; }
.swap-enter-active, .swap-leave-active { transition: all .35s ease; }
.swap-enter-from { opacity: 0; transform: translateY(8px); } .swap-leave-to { opacity: 0; transform: translateY(-8px); }

/* ---- copy ---- */
.cb-copy { position: absolute; left: 24px; bottom: 22px; z-index: 5; }
.cb-copy .tagline { margin: 0; color: #0f172a; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 800; text-transform: uppercase;
  font-size: clamp(1.3rem, 2.3vw, 1.85rem); line-height: 1.08; letter-spacing: -.015em; text-shadow: 0 0 14px rgba(248, 250, 252, .95), 0 0 4px rgba(248, 250, 252, .9); animation: cb-tag .8s cubic-bezier(.2, .8, .2, 1) backwards .25s; }
.cb-copy .tagline .acc { color: #16a34a; }
.cb-copy .caption { margin: 8px 0 0; max-width: 190px; font-size: .72rem; font-weight: 500; line-height: 1.4; color: #64748b; text-shadow: 0 0 8px rgba(248, 250, 252, .95); animation: cb-tag .8s ease backwards .5s; }
@keyframes cb-tag { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

.cb-pause { position: absolute; right: 12px; bottom: 12px; z-index: 6; width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(15, 23, 42, .12); background: rgba(255, 255, 255, .85);
  color: #475569; font-size: .6rem; cursor: pointer; backdrop-filter: blur(4px); transition: transform .2s, background .2s; }
.cb-pause:hover { transform: scale(1.12); background: #fff; }
.coin-banner.paused *, .coin-banner.paused { animation-play-state: paused !important; }

@media (max-width: 820px) { .cb-stage { --ps: .6; left: 64%; top: 45%; } .cb-copy .tagline { font-size: 1.2rem; } }
@media (max-width: 480px) { .cb-copy .caption { display: none; } }
</style>
