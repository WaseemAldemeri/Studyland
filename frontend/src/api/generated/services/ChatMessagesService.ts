/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PagedListOfChatMessageDtoAndNullableOfDateTimeOffset } from '../models/PagedListOfChatMessageDtoAndNullableOfDateTimeOffset';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatMessagesService {
    /**
     * @param channelId
     * @param cursor
     * @param pageSize
     * @returns PagedListOfChatMessageDtoAndNullableOfDateTimeOffset OK
     * @throws ApiError
     */
    public static getMessages(
        channelId?: string,
        cursor?: string,
        pageSize?: number,
    ): CancelablePromise<PagedListOfChatMessageDtoAndNullableOfDateTimeOffset> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ChatMessages',
            query: {
                'ChannelId': channelId,
                'Cursor': cursor,
                'PageSize': pageSize,
            },
        });
    }
}
