/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HeatmapDto } from '../models/HeatmapDto';
import type { PersonalRecordsDto } from '../models/PersonalRecordsDto';
import type { RecapDto } from '../models/RecapDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InsightsService {
    /**
     * @returns PersonalRecordsDto OK
     * @throws ApiError
     */
    public static getPersonalRecords(): CancelablePromise<PersonalRecordsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Insights/records',
        });
    }
    /**
     * @param days
     * @returns HeatmapDto OK
     * @throws ApiError
     */
    public static getStudyHeatmap(
        days: number = 365,
    ): CancelablePromise<HeatmapDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Insights/heatmap',
            query: {
                'days': days,
            },
        });
    }
    /**
     * @param period
     * @returns RecapDto OK
     * @throws ApiError
     */
    public static getRecap(
        period: string = 'week',
    ): CancelablePromise<RecapDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Insights/recap',
            query: {
                'period': period,
            },
        });
    }
}
