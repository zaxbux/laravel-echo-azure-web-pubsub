import {
	SendMessageError,
	type OnGroupDataMessageArgs,
	//OnServerDataMessageArgs,
	type WebPubSubClient,
} from '@azure/web-pubsub-client'
import { Channel, EventFormatter } from 'laravel-echo'

export type ChannelOptions = any

/**
 * This class represents a Azure Web PubSub channel.
 */
export class AzureChannel extends Channel {
	/** The Azure Web PubSub client instance. */
	client: WebPubSubClient

	/** The name of the channel. */
	name: string

	/**
	 * Channel options.
	 */
	options: ChannelOptions

	/**
	 * The event formatter.
	 */
	eventFormatter: EventFormatter

	events: Map<string, (channel: string, data: any) => void> = new Map()

	/**
	 * The subscription of the channel.
	 */
	private subscription: (e: OnGroupDataMessageArgs) => void

	private listeners: Map<string, Function[]> = new Map()
	private globalListeners: Function[] = []

	errorHandlers: Function[] = []
	subscribeHandlers: Function[] = []

	/**
	 * Create a new class instance.
	 */
	constructor(client: WebPubSubClient, name: string, options: ChannelOptions) {
		super()

		this.name = name
		this.client = client
		this.options = options
		this.eventFormatter = new EventFormatter(this.options.namespace)

		this.subscription = ({ message }) => {
			console.debug(`subscription()`, message)
			const { dataType, data, sequenceId, group, fromUserId } = message

			if (group !== this.name) {
				return
			}

			if (dataType === 'json') {
				const { event, payload } = data as { event: string; payload: any }

				// Global callbacks
				let namespace = this.options.namespace.replace(/\./g, '\\')
				let formattedEvent = event.startsWith(namespace)
					? event.substring(namespace.length + 1)
					: '.' + event
				this.globalListeners.forEach((cb) =>
					cb(formattedEvent, { event, payload, sequenceId, fromUserId })
				)

				// Event-specific callbacks
				this.events.get(event)?.(this.name, { event, payload, sequenceId, fromUserId })
			}
		}

		this.subscribe()
	}

	/**
	 * Subscribe to a channel.
	 */
	subscribe(): any {
		console.debug(`subscribe()`, this.name)
		this.client.on('group-message', this.subscription)

		this.client
			.joinGroup(this.name, {
				ackId: undefined,
			})
			.then(({ ackId, isDuplicated }) => {
				console.debug(`Joined Group ${this.name}`)
				this.subscribeHandlers.map((cb) => cb.call(undefined, { ackId, isDuplicated }))
			})
			.catch((reason) => {
				console.error(`Error joining group ${this.name}`, reason)
				if (reason instanceof SendMessageError) {
					console.debug(reason.errorDetail)
				}
				this.errorHandlers.map((cb) => cb.call(undefined, reason))
			})
	}

	/**
	 * Unsubscribe from a channel.
	 */
	unsubscribe(): void {
		console.debug(`unsubscribe()`, this.name)
		this.unbind()
		this.client.off('group-message', this.subscription)

		this.client.leaveGroup(this.name, {
			ackId: undefined,
		})
	}

	/**
	 * Listen for an event on the channel instance.
	 */
	listen(event: string, callback: Function): AzureChannel {
		console.debug(`listen()`, { event, callback })
		this.on(this.eventFormatter.format(event), callback)

		return this
	}

	/**
	 * Listen for all events on the channel instance.
	 */
	listenToAll(callback: Function): AzureChannel {
		console.debug(`listenToAll()`)

		this.globalListeners.push(callback)

		return this
	}

	/**
	 * Stop listening for an event on the channel instance.
	 */
	stopListening(event: string, callback?: Function): AzureChannel {
		console.debug(`stopListening()`, { event, callback })
		this.unbindEvent(this.eventFormatter.format(event), callback)

		return this
	}

	/**
	 * Stop listening for all events on the channel instance.
	 */
	stopListeningToAll(callback?: Function): AzureChannel {
		this.unbindAll(callback)

		return this
	}

	/**
	 * Register a callback to be called anytime a subscription succeeds.
	 */
	subscribed(callback: Function): AzureChannel {
		console.debug(`subscribed()`)
		this.subscribeHandlers.push(callback)

		// this.on('connect', (socket) => {
		// 	callback(socket)
		// })

		return this
	}

	/**
	 * Register a callback to be called anytime an error occurs.
	 */
	error(callback: Function): AzureChannel {
		console.debug(`error()`)
		this.errorHandlers.push(callback)

		return this
	}

	/**
	 * Bind a channel to an event.
	 */
	on(event: string, callback: Function): AzureChannel {
		console.debug(`on()`, { event, callback })
		let listeners = this.listeners.get(event) || []

		if (!this.events.has(event)) {
			this.events.set(event, (channel, data) => {
				if (this.name === channel && listeners) {
					listeners.forEach((cb) => cb(data))
				}
			})

			//this.socket.on(event, this.events.get(event)
		}

		listeners.push(callback)

		this.listeners.set(event, listeners)

		return this
	}

	/**
	 * Unbind the channel's socket from all stored event callbacks.
	 */
	unbind(): void {
		this.events.forEach((_fn, event) => {
			this.unbindEvent(event)
		})
	}

	unbindAll(callback?: Function): void {
		if (callback) {
			this.globalListeners = this.globalListeners.filter((cb) => cb !== callback)
		}

		if (!callback) {
			this.globalListeners = []
		}
	}

	/**
	 * Unbind the listeners for the given event.
	 */
	protected unbindEvent(event: string, callback?: Function): void {
		let listeners = this.listeners.get(event) || []

		if (callback) {
			listeners = listeners.filter((cb) => cb !== callback)
		}

		if (!callback || listeners.length === 0) {
			if (this.events.has(event)) {
				//this.socket.removeListener(event, this.events.get(event))

				this.events.delete(event)
			}

			this.listeners.delete(event)
		} else {
			this.listeners.set(event, listeners)
		}
	}
}
