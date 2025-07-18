<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// import Linear from './Linear.svelte?vue'

const Counter = defineAsyncComponent(() => import('./Counter.svelte?vue'));
</script>

<template>
  <Counter />
</template>
