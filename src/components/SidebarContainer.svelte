<script lang="ts">
	import Sidebar from './Sidebar.svelte'
</script>

<div class="side"><Sidebar fullWidth /></div>
<div class="bottom">
	<details><summary>Options</summary><Sidebar /></details>
</div>

<style>
	.bottom {
		display: none; /* Overridden in media query */
		position: fixed;
		bottom: 0;
		left: 0;
		width: calc(100% - 2rem);
		padding: 0.75rem 0.5rem 0;
		margin: 0 1rem;
		box-sizing: border-box;
		background: var(--color-bg);
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
		box-shadow: 0 0 0 1px var(--color-fg), 0 -3px 8px 8px var(--color-bg);
		z-index: 99999;
	}

	details {
		max-height: 2.125rem;
		transition: max-height 60ms ease-out;
	}

	details[open] {
		max-height: 80vh;
		overflow-y: scroll;
	}

	summary {
		text-align: center;
		padding-bottom: 0.75rem;
	}

	@media (max-width: 1106px) {
		.side {
			display: none;
		}
		.bottom {
			display: block;
		}
	}
</style>
