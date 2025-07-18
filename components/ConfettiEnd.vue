<script setup>
import { vConfetti } from '@neoconfetti/vue';

let particle_count = 400;
</script>

<template>
  <div style="top: 72%; left: -27vh" v-confetti="{
    force: 0.9,
    particleCount: particle_count,
    duration: 4000
  }" />

  <div style="top: 22%; right: -54vh" v-confetti="{
    colors: ['#90EE90', '#a2cffe', 'hotpink', '#FFFF00', '#39FF14'],
    force: 0.9,
    particleCount: particle_count,
    duration: 4000
  }"></div>
</template>
