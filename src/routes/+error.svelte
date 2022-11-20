<script lang="ts">
	import { page } from '$app/stores'
</script>

<h1>{$page.error?.name || `Error ${$page.status}`}</h1>
<h2>{@html $page.error?.message || 'Unknown error occurred!'}</h2>

<style>
	h2 {
		text-align: center;
	}
</style>
