import { defineStore } from 'pinia'

const USERS_KEY = 'users'
const SESSION_KEY = 'currentUser'

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const DEMO_USER = { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'demo123' }

// The demo account must always exist - even if other users signed up before
function seedUsers() {
  const saved = read(USERS_KEY, [])
  const users = Array.isArray(saved) ? saved : []
  if (!users.some((u) => u.email === DEMO_USER.email)) {
    users.unshift({ ...DEMO_USER })
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
  return users
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: seedUsers(),
    currentUser: read(SESSION_KEY, null)
  }),
  getters: {
    isAuthenticated: (state) => !!state.currentUser
  },
  actions: {
    signup({ name, email, password }) {
      const mail = email.trim().toLowerCase()
      if (this.users.some((u) => u.email === mail)) {
        return { ok: false, error: 'An account with this email already exists.' }
      }
      this.users.push({ id: Date.now(), name: name.trim(), email: mail, password })
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
      return { ok: true }
    },
    login({ email, password }) {
      const mail = email.trim().toLowerCase()
      const user = this.users.find((u) => u.email === mail && u.password === password)
      if (!user) return { ok: false, error: 'Invalid email or password.' }
      this.currentUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar || '' }
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser))
      return { ok: true }
    },
    setAvatar(dataUrl) {
      if (!this.currentUser) return
      this.currentUser.avatar = dataUrl || ''
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser))
      const u = this.users.find((x) => x.id === this.currentUser.id)
      if (u) {
        u.avatar = dataUrl || ''
        localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
      }
    },
    logout() {
      this.currentUser = null
      localStorage.removeItem(SESSION_KEY)
    }
  }
})
