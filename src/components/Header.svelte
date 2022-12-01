<header>
	<h1><small><span><i>📅</i> w</span>/<span>e</span></small>Whenever</h1>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 0.25rem 1rem;
		width: 100%;
		max-width: 1140px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	h1 {
		font-size: 2em;
		margin: 0;
	}

	h1 small {
		font-size: 0.9em;
		margin-right: 0.5em;
		position: relative;
		bottom: 1px;
		background-color: var(--color-fg);
		color: var(--color-bg);
		padding: 0 3px 0 2px;
		border-radius: 1rem;
		border-top-left-radius: 0.25rem;
		border-bottom-left-radius: 0.25rem;
	}

	h1 small span {
		display: inline-block;
		font-size: 0.8em;
		position: relative;
		bottom: 0.25rem;
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

	@media (max-width: 1106px) {
		header {
			padding-left: 1rem;
		}
	}
</style>
