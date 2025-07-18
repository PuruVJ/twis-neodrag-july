<script>
	import { confetti } from '@neoconfetti/svelte';
	import { onMount, tick } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	const DURATION = 4000;

	const linear = tweened(0, { duration: DURATION });
	const cubic = tweened(0, {
		easing: cubicInOut,
		duration: DURATION,
	});

	let invert = $state(false);
	let partytime = $state(false);

	function move() {
		const value = !invert ? 700 : 0;
		$linear = $cubic = value;
		invert = !invert;
	}

	onMount(() => {
		move();

		setInterval(() => {
			move();
		}, 4000);
	});
</script>

{#if partytime}
	<div class="confetti" use:confetti={{ colors: ['#eee', 'black'] }}></div>
{/if}

<button
	onclick={async () => {
		partytime = false;
		await tick();
		partytime = true;
	}}
>
	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
		><path
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M3.675 20.971a.508.508 0 0 1-.65-.637L5.615 9.21c.12-.374.6-.475.862-.183l7.756 7.544a.51.51 0 0 1-.212.82zm7.219-11.695L13.3 6.66q1.925-2.092.481-3.661M8 5.25v-.5m12-.25V4m0 9.5V13m-2 5.5V18m-4.219-5.586l2.406-2.615q2.407-2.616 4.813 0"
		/></svg
	>
</button>

<section>
	<h2>Linear</h2>
	<div class="ball" style:translate="{$linear}% 0%"></div>
</section>
<br />
<br />
<br />
<br />
<br />
<section>
	<h2>Cubic</h2>
	<div class="ball" style:translate="{$cubic}% 0%"></div>
</section>

<style>
	section {
		display: flex;
		gap: 1rem;
	}

	.ball {
		height: 100px;
		width: 100px;

		border-radius: 50%;

		background-color: black;
		box-shadow:
			0px 1.3px 5px rgba(0, 0, 0, 0.085),
			0px 4.2px 16.8px rgba(0, 0, 0, 0.125),
			0px 19px 75px rgba(0, 0, 0, 0.21);
	}

	button,
	.confetti {
		position: fixed;
		top: 10px;
		right: 10px;
		font-size: 2rem;
	}

	.confetti {
		right: 20px;
	}
</style>
