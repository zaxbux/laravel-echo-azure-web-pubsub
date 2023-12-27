import type { OnServerDataMessageArgs, WebPubSubClient } from '@azure/web-pubsub-client'
import { Channel, EventFormatter } from 'laravel-echo'

/**
 * This class represents a Azure Web PubSub channel.
 */
export class AzureChannel extends Channel {
	name: any
	client: WebPubSubClient
	eventFormatter: any

	/**
	 * Create a new class instance.
	 */
	constructor(client: WebPubSubClient, name: any, options: any) {
		super()

		this.name = name
		this.client = client
		this.options = options
		this.eventFormatter = new EventFormatter(this.options.namespace)

		this.subscribe()
	}

	messageHandler({ message }: OnServerDataMessageArgs): void {
		console.log({ message })
	}

	/**
	 * Subscribe to a channel.
	 */
	subscribe(): any {
		this.client.on('server-message', this.messageHandler)
	}

	/**
	 * Unsubscribe from a channel.
	 */
	unsubscribe(): void {
		this.client.off('server-message', this.messageHandler)
	}

	/**
	 * Listen for an event on the channel instance.
	 */
	listen(event: string, callback: Function): AzureChannel {
		this.on(event, callback)

		return this
	}

	/**
	 * Listen for all events on the channel instance.
	 */
	listenToAll(_callback: Function): AzureChannel {
		return this
	}

	/**
	 * Stop listening for an event on the channel instance.
	 */
	stopListening(_event: string, _callback?: Function): AzureChannel {
		return this
	}

	/**
	 * Register a callback to be called anytime a subscription succeeds.
	 */
	subscribed(_callback: Function): AzureChannel {
		return this
	}

	/**
	 * Register a callback to be called anytime an error occurs.
	 */
	error(_callback: Function): AzureChannel {
		return this
	}

	/**
	 * Bind a channel to an event.
	 */
	on(_event: string, _callback: Function): AzureChannel {
		return this
	}
}
