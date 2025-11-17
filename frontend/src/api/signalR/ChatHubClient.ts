import { HubConnection } from "@microsoft/signalr";
import type { HubEventCallbacks, HubMethodParams } from "./ChatHubTypes";
import { OpenAPI } from "../generated";

export const HUB_URL = OpenAPI.BASE + "/api/hubs/chat"

/**
 * A wrapper that makes the hub connection calls strogly-typed
 */
export class ChatHubClient {
  private connection: HubConnection;

  constructor(connection: HubConnection) {
    this.connection = connection;
  }

  /**
   * Invokes a strongly-typed method on the hub.
   * @example
   * client.invoke("JoinChannel", "guid-1234")
   */
  public invoke<T extends keyof HubMethodParams>(
    method: T,
    ...args: HubMethodParams[T]
  ): Promise<void> {
    return this.connection.invoke(method, ...args);
  }

  /**
   * Subscribes to a strongly-typed event from the hub.
   * @example
   * client.on("ReceiveMessage", (message) => {
   * // 'message' is of type ChatMessageDto
   * console.log(message.body);
   * });
   */
  public on<T extends keyof HubEventCallbacks>(
    event: T,
    callback: HubEventCallbacks[T]
  ) {
    this.connection.on(event, callback);
  }

  /**
   * Unsubscribes from a strongly-typed event.
   * @example
   * client.off("ReceiveMessage", myCallbackFunction);
   */
  public off<T extends keyof HubEventCallbacks>(
    event: T,
    callback: HubEventCallbacks[T]
  ) {
    this.connection.off(event, callback);
  }
}