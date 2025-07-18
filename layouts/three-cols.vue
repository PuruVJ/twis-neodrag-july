<script setup lang="ts"></script>

<template>
  <section class="slidev-layout four-col">
    <div class="col1">
      <slot name="col1" />
    </div>

    <div class="col2">
      <slot name="col2" />
    </div>

    <div class="col3">
      <slot name="col3" />
    </div>
  </section>
</template>

<style scoped>
.four-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;

  width: 100%;
}
</style>