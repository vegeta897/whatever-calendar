<script lang="ts">
	import { cubicIn, sineIn } from 'svelte/easing'

	export let YYYYMMDD: string
	export let count: number

	$: countArray = new Array(count)
	$: rowArray = new Array(count > 4)
</script>

<svg viewBox="0 0 3 1" version="1.1" xmlns="http://www.w3.org/2000/svg">
	{#each countArray as _, p}
		{@const dir = 1 - (p % 2) * 2}
		{@const pos =
			Math.floor((p + 1 + (count % 2 === 0 ? 1 : 0)) / 2) -
			(count % 2 === 0 ? 0.5 : 0)}
		{@const scale = 1 - cubicIn(pos / 5.5)}
		{@const dist = 1 - sineIn(pos / 10)}
		<circle
			cx={1.5 + dir * pos * 0.32 * dist}
			cy={0.09 * dist}
			r={0.09 * scale}
		/>
		<path
			stroke-width={0.18 * scale}
			stroke="#fff"
			stroke-linejoin="round"
			d="M{1.5 + dir * pos * 0.32 * dist + 0.06 * scale} {0.3 * dist} h{-0.12 *
				scale} q{0.06 * scale} {-0.1 * scale} {0.12 * scale} 0 Z"
		/>
		<!-- <clipPath id="circle-{YYYYMMDD}-{p}">
			<circle cx={1.5 + (p + 0.5 - count / 2) * 0.25} cy="0.25" r="0.25" />
		</clipPath>
		<g clip-path="url(#circle-{YYYYMMDD}-{p}">
			<circle cx={1.5 + (p + 0.5 - count / 2) * 0.25} cy="0.25" r="0.26" />
			<circle
				fill="#000"
				cx={1.5 + (p + 0.5 - count / 2) * 0.25}
				cy="0.25"
				r="0.2"
			/>
			<circle cx={1.5 + (p + 0.5 - count / 2) * 0.25} cy="0.22" r="0.09" />
			<circle cx={1.5 + (p + 0.5 - count / 2) * 0.25} cy="0.76" r="0.4" />
		</g> -->
		<!-- <circle cx={1.5 + (p + 0.5 - count / 2) * 0.25} cy="0.09" r="0.09" />
		<path
			stroke-width="0.18"
			stroke="#fff"
			stroke-linejoin="round"
			d="M{1.5 +
				(p + 0.5 - count / 2) * 0.25 +
				0.07} 0.30 h-0.14 q0.07 -0.10 0.14 0 Z"
		/> -->
	{/each}
</svg>

<style>
	svg {
		opacity: 0.65;
		fill: #fff;
	}
</style>
