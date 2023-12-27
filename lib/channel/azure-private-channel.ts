import { AzureChannel } from './azure-channel'

/**
 * This class represents a null private channel.
 */
export class AzurePrivateChannel extends AzureChannel {
	/**
	 * Send a whisper event to other clients in the channel.
	 */
	whisper(_eventName: string, _data: any): AzurePrivateChannel {
		return this
	}
}
