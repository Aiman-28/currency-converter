<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()
const showNav = computed(() => !!route.meta.requiresAuth)
</script>

<template>
  <Navbar v-if="showNav" />
  <main :class="showNav ? 'container' : ''">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </main>
</template>
