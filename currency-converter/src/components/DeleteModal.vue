<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm delete' },
  message: { type: String, default: 'This action cannot be undone.' },
  confirmText: { type: String, default: 'Delete' }
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal card">
      <h3>{{ title }}</h3>
      <p class="muted">{{ message }}</p>
      <div class="row end">
        <button class="btn btn-outline" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>
