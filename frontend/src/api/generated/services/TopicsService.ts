/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TopicDto } from '../models/TopicDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TopicsService {
    /**
     * @returns TopicDto OK
     * @throws ApiError
     */
    public static getTopics(): CancelablePromise<Array<TopicDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Topics',
        });
    }
}
