<script lang="ts" setup>
// @ts-ignore
import squircle from './squircle.js?url';

import { bounds, BoundsFrom, transform, vDraggable } from '@neodrag/vue';
import { onMounted } from 'vue';

onMounted(() => {
  if ('paintWorklet' in CSS) {
    // @ts-ignore
    CSS.paintWorklet.addModule(squircle);
  }
})

function fn(rootNode: HTMLElement | SVGElement, offset: { x: number, y: number }) {
  const computed_val = window.getComputedStyle(rootNode)
  console.log(computed_val.transform)

  rootNode.style.left = `${offset.x}px`;
  rootNode.style.top = `${offset.y}px`;
}
</script>

<template>
  <div v-draggable="[bounds(BoundsFrom.parent()),]"> Drag me</div>
</template>

<style scoped>
div {
  --size: 7rem;

  position: relative;

  display: grid;
  place-content: center;

  text-align: center;

  width: var(--size, 8rem);
  height: var(--size, 8rem);

  z-index: 0;

  padding: 1rem;

  background-image: var(--app-color-primary-gradient);

  border-radius: 1rem;
  box-shadow:
    0px 12.5px 10px rgba(0, 0, 0, 0.035),
    0px 100px 80px rgba(0, 0, 0, 0.07);

  mask-image: paint(squircle);
  --squircle-radius: 50px;
  --squircle-smooth: 1;

  font-size: 1rem;
  color: var(--app-color-primary-contrast);

  cursor: grab;
}
</style>