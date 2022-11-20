<script>
	import github from '$lib/images/github.svg'
</script>

<header>
	<h1><small><span><i>📅</i> w</span>/<span>e</span></small>Whenever</h1>
	<div class="corner">
		<a href="https://github.com/vegeta897/whatever-calendar">
			<img class="circle" src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 48px;
		height: 48px;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	img.circle {
		background-color: rgb(196, 196, 196);
		border-radius: 50%;
	}

	h1 {
		width: 100%;
		font-size: 2em;
		margin: 0;
		margin-left: 48px;
	}

	h1 small {
		font-size: 0.9em;
		margin-right: 0.5em;
		position: relative;
		bottom: 1px;
		background-color: var(--color-fg);
		color: var(--color-bg);
		padding: 0 3px 0 2px;
		border-radius: 16px;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
	}

	h1 small span {
		display: inline-block;
		font-size: 0.8em;
		position: relative;
		bottom: 4px;
		left: 1px;
		transform: scaleY(0.95);
	}

	h1 small span i {
		font-style: normal;
		text-shadow: 0 0.5px 2px #000;
	}

	h1 small span:last-child {
		left: -1px;
	}
</style>
