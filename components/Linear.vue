<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// import Linear from './Linear.svelte?vue'

const Linear = defineAsyncComponent(() => import('./Linear.svelte?vue'));
</script>

<template>
  <Linear />
</template>
