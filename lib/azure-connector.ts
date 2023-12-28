import {
	JSONTypes,
	SendEventOptions,
	WebPubSubClient,
	WebPubSubDataType,
	WebPubSubResult,
	type WebPubSubClientOptions,
} from '@azure/web-pubsub-client'
import { Connector, type PresenceChannel } from 'laravel-echo'
import {
	AzureChannel,
	AzureEncryptedPrivateChannel,
	AzurePresenceChannel,
	AzurePrivateChannel,
} from './channel'

export interface AzureConnectorOptions extends WebPubSubClientOptions {
	client?: WebPubSubClient
	clientAccessUri: string
}

/**
 * This class creates a connector to Azure.
 */
export class AzureConnector extends Connector {
	/**
	 * Connector options.
	 */
	declare options: AzureConnectorOptions

	/**
	 * The Azure instance.
	 */
	declare client: WebPubSubClient

	/**
	 * All of the subscribed channel names.
	 */
	channels: Map<string, AzureChannel> = new Map()

	userId?: string
	connectionId?: string

	/* constructor(options: AzureConnectorOptions) {
		super(options)
	} */

	/**
	 * Create a fresh Azure connection.
	 */
	connect(): void {
		if (typeof this.options.client !== 'undefined') {
			this.client = this.options.client
		} else {
			const {
				clientAccessUri,
				protocol,
				autoReconnect,
				autoRejoinGroups,
				messageRetryOptions,
				reconnectRetryOptions,
			} = this.options

			this.client = new WebPubSubClient(clientAccessUri, {
				protocol,
				autoReconnect,
				autoRejoinGroups,
				messageRetryOptions,
				reconnectRetryOptions,
			})
		}

		this.handleEvents()
		this.client.start()
	}

	/**
	 * Listen for an event on a channel instance.
	 */
	listen(name: string, event: string, callback: Function): AzureChannel {
		return this.channel(name).listen(event, callback)
	}

	/**
	 * Get a channel instance by name.
	 */
	channel(name: string): AzureChannel {
		if (!this.channels.has(name)) {
			this.channels.set(name, new AzureChannel(this.client, name, this.options))
		}

		return this.channels.get(name)!
	}

	/**
	 * Get a private channel instance by name.
	 */
	privateChannel(name: string): AzureChannel {
		name = 'private-' + name
		if (!this.channels.has(name)) {
			this.channels.set(name, new AzurePrivateChannel(this.client, name, this.options))
		}

		return this.channels.get(name)!
	}

	/**
	 * Get a private encrypted channel instance by name.
	 */
	encryptedPrivateChannel(name: string): AzureChannel {
		name = 'private-encrypted-' + name

		if (!this.channels.has(name)) {
			this.channels.set(name, new AzureEncryptedPrivateChannel(
				this.client,
				name,
				this.options
			))
		}

		return this.channels.get(name)!
	}

	/**
	 * Get a presence channel instance by name.
	 */
	presenceChannel(name: string): PresenceChannel {
		name = 'presence-' + name

		if (!this.channels.has(name)) {
			this.channels.set(name, new AzurePresenceChannel(
				this.client,
				name,
				this.options
			))
		}

		return this.channels.get(name)! as unknown as PresenceChannel
	}

	/**
	 * Leave the given channel, as well as its private and presence variants.
	 */
	leave(name: string): void {
		const channels = [name, 'private-' + name, 'private-encrypted-' + name, 'presence-' + name]

		channels.forEach((name: string, _index: number) => {
			this.leaveChannel(name)
		})
	}

	/**
	 * Leave the given channel.
	 */
	leaveChannel(name: string): void {
		if (this.channels.has(name)) {
			this.channels.get(name)!.unsubscribe()

			this.channels.delete(name)
		}
	}

	/**
	 * Get the socket ID for the connection.
	 */
	socketId(): string {
		return this.connectionId ?? ''
	}

	/**
	 * Disconnect Azure connection.
	 */
	disconnect(): void {
		this.client?.stop()
	}

	sendEvent(
		eventName: string,
		content: JSONTypes | ArrayBuffer,
		dataType: WebPubSubDataType,
		options?: SendEventOptions
	): Promise<WebPubSubResult> {
		return this.client.sendEvent(eventName, content, dataType, options)
	}

	private handleEvents(): void {
		this.client?.on('connected', ({ connectionId, userId }) => {
			console.debug(`[Web PubSub] [${connectionId}] Connected: ${userId}`)
			this.connectionId = connectionId
			this.userId = userId
		})
		this.client?.on('disconnected', ({ connectionId, message }) => {
			console.debug(`[Web PubSub] [${connectionId}] Disconnected: ${message}`)
			this.connectionId = undefined
			//this.userId = undefined
		})
		this.client?.on('stopped', () => {
			console.debug(`[Web PubSub] Stopped`)
		})
		this.client?.on('rejoin-group-failed', ({ group, error }) => {
			console.log(`[Web PubSub] Rejoin group ${group} failed: ${error}`)
		})
		this.client?.on('group-message', ({ message }) => {
			const { dataType, data, sequenceId, group, fromUserId } = message
			console.log(`[Web PubSub] Group [${group}] Message`, {
				dataType,
				data,
				sequenceId,
				fromUserId,
			})
		})
		this.client?.on('server-message', ({ message }) => {
			const { dataType, data, sequenceId } = message
			console.log(`[Web PubSub] Server Message`, { dataType, data, sequenceId })
		})
	}
}
