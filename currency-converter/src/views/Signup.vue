<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AuthLayout from '../components/AuthLayout.vue'
import FormField from '../components/FormField.vue'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', password: '', confirm: '' })
const serverError = ref('')
const pwFocus = ref(false)
const pwShown = ref(false)
const shy = computed(() => pwFocus.value && !pwShown.value)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.name = form.name.trim() ? '' : 'Full name is required.'
  errors.email = !form.email.trim() ? 'Email is required.' : !emailRe.test(form.email.trim()) ? 'Enter a valid email address.' : ''
  errors.password = form.password ? '' : 'Password cannot be empty.'
  errors.confirm = !form.confirm ? 'Please confirm your password.' : form.confirm !== form.password ? 'Passwords do not match.' : ''
  return !Object.values(errors).some(Boolean)
}

function submit() {
  serverError.value = ''
  if (!validate()) return
  const res = auth.signup(form)
  if (!res.ok) {
    serverError.value = res.error
    return
  }
  router.push({ name: 'login', query: { registered: '1' } })
}
</script>

<template>
  <AuthLayout title="CREATE ACCOUNT" subtitle="Join CurrencyX and start converting today" :shy="shy">
    <form class="stagger" @submit.prevent="submit" novalidate>
      <div v-if="serverError" class="alert alert-error shake">{{ serverError }}</div>

      <FormField id="name" v-model="form.name" label="Full Name" autocomplete="name" :error="errors.name" />
      <FormField id="email" v-model="form.email" label="Email" type="email" autocomplete="email" :error="errors.email" />
      <FormField
        id="password" v-model="form.password" label="Password" type="password" autocomplete="new-password"
        :error="errors.password" @focus="pwFocus = true" @blur="pwFocus = false" @reveal="pwShown = $event"
      />
      <FormField
        id="confirm" v-model="form.confirm" label="Confirm Password" type="password" autocomplete="new-password"
        :error="errors.confirm" @focus="pwFocus = true" @blur="pwFocus = false" @reveal="pwShown = $event"
      />

      <button class="btn btn-dark btn-block" type="submit">Sign Up</button>
      <p class="muted center">Already have an account? <router-link to="/login">Sign in</router-link></p>
    </form>
  </AuthLayout>
</template>
