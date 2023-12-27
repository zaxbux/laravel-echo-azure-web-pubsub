import { AzureChannel } from './azure-channel'
import type { PresenceChannel } from 'laravel-echo'

/**
 * This class represents a null presence channel.
 */
export class AzurePresenceChannel extends AzureChannel implements PresenceChannel {
	/**
	 * Register a callback to be called anytime the member list changes.
	 */
	here(_callback: Function): AzurePresenceChannel {
		return this
	}

	/**
	 * Listen for someone joining the channel.
	 */
	joining(_callback: Function): AzurePresenceChannel {
		return this
	}

	/**
	 * Send a whisper event to other clients in the channel.
	 */
	whisper(_eventName: string, _data: any): AzurePresenceChannel {
		return this
	}

	/**
	 * Listen for someone leaving the channel.
	 */
	leaving(_callback: Function): AzurePresenceChannel {
		return this
	}
}
