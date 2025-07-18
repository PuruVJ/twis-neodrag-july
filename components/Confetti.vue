<script setup>
import { vConfetti } from '@neoconfetti/vue'
import { onMounted, ref } from 'vue';

const key = ref(0)

onMounted(() => {
  setInterval(() => {
    key.value++;
  }, 3500);
})
</script>

<template>
  <div :key="key" v-confetti="{ force: 1 }"></div>
</template>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 50%;
}
</style>