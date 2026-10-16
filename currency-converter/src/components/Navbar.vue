<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCurrencyStore } from '../stores/currencyStore'
import BrandLogo from './BrandLogo.vue'
import UserAvatar from './UserAvatar.vue'

const auth = useAuthStore()
const currency = useCurrencyStore()
const router = useRouter()
const open = ref(false)
const menu = ref(false)
const menuRoot = ref(null)
const photoError = ref('')

function logout() {
  auth.logout()
  currency.loadHistory()
  router.push('/login')
}

// crop to a square and shrink so the photo stays small in localStorage
function onPhoto(e) {
  const file = e.target.files[0]
  e.target.value = ''
  photoError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) return (photoError.value = 'Please choose an image file.')
  if (file.size > 5 * 1024 * 1024) return (photoError.value = 'Image must be smaller than 5 MB.')
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const size = 160
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const side = Math.min(img.width, img.height)
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      auth.setAvatar(canvas.toDataURL('image/jpeg', 0.85))
      menu.value = false
    }
    img.onerror = () => (photoError.value = 'That image could not be read.')
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

const onDoc = (e) => {
  if (menuRoot.value && !menuRoot.value.contains(e.target)) menu.value = false
}
onMounted(() => document.addEventListener('mousedown', onDoc))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))
</script>

<template>
  <header class="navbar">
    <div class="nav-inner">
      <router-link to="/dashboard" class="brand"><BrandLogo /></router-link>
      <button class="burger" @click="open = !open" aria-label="Toggle menu">☰</button>
      <nav :class="['links', { open }]">
        <router-link to="/dashboard" @click="open = false">Dashboard</router-link>
        <router-link to="/converter" @click="open = false">Converter</router-link>
        <router-link to="/history" @click="open = false">History</router-link>

        <div ref="menuRoot" class="user-menu">
          <button type="button" class="user-btn" :aria-expanded="menu" @click="menu = !menu">
            <UserAvatar :user="auth.currentUser" :size="30" />
            <span class="user-name">{{ auth.currentUser?.name }}</span>
            <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <Transition name="drop">
            <div v-if="menu" class="menu-panel">
              <div class="menu-head">
                <UserAvatar :user="auth.currentUser" :size="46" />
                <div><strong>{{ auth.currentUser?.name }}</strong><div class="muted small">{{ auth.currentUser?.email }}</div></div>
              </div>
              <label class="menu-item">
                📷 {{ auth.currentUser?.avatar ? 'Change photo' : 'Upload photo' }}
                <input type="file" accept="image/*" hidden @change="onPhoto" />
              </label>
              <button v-if="auth.currentUser?.avatar" type="button" class="menu-item" @click="auth.setAvatar('')">🗑 Remove photo</button>
              <small v-if="photoError" class="error menu-err">{{ photoError }}</small>
              <button type="button" class="menu-item danger" @click="logout">⎋ Logout</button>
            </div>
          </Transition>
        </div>
      </nav>
    </div>
  </header>
</template>
