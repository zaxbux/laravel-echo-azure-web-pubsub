import { AzureChannel } from './channel'

/**
 * This class represents a null private channel.
 */
export class AzurePrivateChannel extends AzureChannel {
	/**
	 * Send a whisper event to other clients in the channel.
	 */
	whisper(eventName: string, data: object): AzurePrivateChannel {
		//this.client.channels.channels[this.name].trigger(`client-${eventName}`, data);

		this.client.sendToGroup(this.name, {
			event: `client-${eventName}`,
			payload: data,
		}, 'json')

		return this
	}
}
