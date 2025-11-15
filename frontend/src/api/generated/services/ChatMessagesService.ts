/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatMessageDto } from '../models/ChatMessageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatMessagesService {
    /**
     * @param channelId
     * @returns ChatMessageDto OK
     * @throws ApiError
     */
    public static getMessages(
        channelId?: string,
    ): CancelablePromise<Array<ChatMessageDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ChatMessages',
            query: {
                'channelId': channelId,
            },
        });
    }
}
