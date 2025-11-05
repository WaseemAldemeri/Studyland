/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatsDto } from '../models/StatsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatsService {
    /**
     * @param userIds
     * @param startDate
     * @param endDate
     * @param topicIds
     * @returns StatsDto OK
     * @throws ApiError
     */
    public static getDashboardStats(
        userIds?: Array<string>,
        startDate?: string,
        endDate?: string,
        topicIds?: Array<string>,
    ): CancelablePromise<StatsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Stats',
            query: {
                'UserIds': userIds,
                'StartDate': startDate,
                'EndDate': endDate,
                'TopicIds': topicIds,
            },
        });
    }
}
