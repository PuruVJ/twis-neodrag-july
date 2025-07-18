<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count--}>-</button>
<span>{count}</span>
<button onclick={() => count++}>+</button>
