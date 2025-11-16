/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TopicDto2 } from '../models/TopicDto2';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TopicsService {
    /**
     * @returns TopicDto2 OK
     * @throws ApiError
     */
    public static getTopics(): CancelablePromise<Array<TopicDto2>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Topics',
        });
    }
}
