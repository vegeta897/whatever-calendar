const listeners: Set<() => void> = new Set()

export function onInterval(callback: () => void) {
	listeners.add(callback)
}

export function offInterval(callback: () => void) {
	if (!listeners.has(callback)) console.error('offInterval received unregistered callback!')
	listeners.delete(callback)
}

setInterval(() => {
	for (const listener of listeners) {
		listener()
	}
}, 1000)
