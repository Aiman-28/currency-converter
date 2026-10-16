import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Signup from '../views/Signup.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Converter from '../views/Converter.vue'
import History from '../views/History.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/signup', name: 'signup', component: Signup, meta: { guestOnly: true } },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/converter', name: 'converter', component: Converter, meta: { requiresAuth: true } },
  { path: '/history', name: 'history', component: History, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' }
})

export default router
