<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCurrencyStore } from '../stores/currencyStore'
import AuthLayout from '../components/AuthLayout.vue'
import FormField from '../components/FormField.vue'

const auth = useAuthStore()
const currency = useCurrencyStore()
const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const serverError = ref('')
const remember = ref(false)
const pwFocus = ref(false)
const pwShown = ref(false)
const shy = computed(() => pwFocus.value && !pwShown.value)

onMounted(() => {
  const saved = localStorage.getItem('rememberedEmail')
  if (saved) {
    form.email = saved
    remember.value = true
  }
})

function useDemo() {
  form.email = 'demo@example.com'
  form.password = 'demo123'
  errors.email = ''
  errors.password = ''
  serverError.value = ''
}

function submit() {
  serverError.value = ''
  errors.email = form.email.trim() ? '' : 'Email is required.'
  errors.password = form.password ? '' : 'Password is required.'
  if (errors.email || errors.password) return
  const res = auth.login(form)
  if (!res.ok) {
    serverError.value = res.error
    return
  }
  if (remember.value) localStorage.setItem('rememberedEmail', form.email.trim())
  else localStorage.removeItem('rememberedEmail')
  currency.loadHistory()
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <AuthLayout title="WELCOME BACK" subtitle="Enter your email and password to access your account" :shy="shy">
    <form class="stagger" @submit.prevent="submit" novalidate>
      <div v-if="route.query.registered" class="alert alert-success">Account created successfully. Please login.</div>
      <div v-if="serverError" class="alert alert-error shake">{{ serverError }}</div>

      <FormField id="email" v-model="form.email" label="Email" type="email" autocomplete="email" :error="errors.email" />
      <FormField
        id="password" v-model="form.password" label="Password" type="password" autocomplete="current-password"
        :error="errors.password" @focus="pwFocus = true" @blur="pwFocus = false" @reveal="pwShown = $event"
      />

      <div class="row-split">
        <label class="check"><input v-model="remember" type="checkbox" /> Remember me</label>
        <a href="#" @click.prevent="serverError = 'Password reset is not available in this demo.'">Forgot Password?</a>
      </div>

      <button class="btn btn-dark btn-block" type="submit">Sign In</button>
      <button class="btn btn-google btn-block" type="button" @click="serverError = 'Google sign-in is not available in this demo.'">
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" /><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
        Sign in with Google
      </button>
      <p class="muted center">Don't have an account? <router-link to="/signup">Sign up</router-link></p>
      <p class="muted center small">Demo account: demo@example.com / demo123 · <button type="button" class="link-btn" @click="useDemo">Fill it in</button></p>
    </form>
  </AuthLayout>
</template>
