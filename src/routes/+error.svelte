<script lang="ts">
	import { page } from '$app/stores'
</script>

<h1>Error {$page.status}</h1>
<h2>{($page.error && $page.error.message) || 'Unknown error occurred!'}</h2>
