const listeners: Set<() => void> = new Set()

let interval: NodeJS.Timer
import.meta.hot?.on('vite:beforeUpdate', () => clearInterval(interval))

export function onInterval(
	callback: () => void,
	onDestroy: (cb: () => void) => void
) {
	listeners.add(callback)
	onDestroy(() => {
		if (!listeners.has(callback))
			console.error('offInterval received unregistered callback!')
		listeners.delete(callback)
	})
	interval ||= setInterval(() => {
		for (const listener of listeners) {
			listener()
		}
	}, 1000)
}
