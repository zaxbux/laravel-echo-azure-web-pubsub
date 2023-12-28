import { AzureChannel } from './channel';

/**
 * This class represents a Azure private channel.
 */
export class AzureEncryptedPrivateChannel extends AzureChannel {
    /**
     * Send a whisper event to other clients in the channel.
     */
    whisper(eventName: string, data: any): AzureEncryptedPrivateChannel {
        //this.client.channels.channels[this.name].trigger(`client-${eventName}`, data);

				this.client.sendToGroup(this.name, {
					event: `client-${eventName}`,
					payload: data,
				}, 'json')

        return this;
    }
}