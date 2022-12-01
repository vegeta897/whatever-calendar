<script lang="ts">
	import Header from '../components/Header.svelte'
	import './styles.css'
</script>

<svelte:head>
	<!-- <title>Whenever?</title> -->
	<meta
		name="description"
		content="Collaborative event availability planning"
	/>
</svelte:head>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		display: flex;
		flex-direction: column;
		padding: 0 1rem;
		width: 100%;
		max-width: 1140px;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
