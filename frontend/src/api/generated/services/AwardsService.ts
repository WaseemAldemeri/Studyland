/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardDto } from '../models/AwardDto';
import type { MilestoneDto } from '../models/MilestoneDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AwardsService {
    /**
     * @returns AwardDto OK
     * @throws ApiError
     */
    public static getAwards(): CancelablePromise<Array<AwardDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Awards',
        });
    }
    /**
     * @returns MilestoneDto OK
     * @throws ApiError
     */
    public static getMyMilestones(): CancelablePromise<Array<MilestoneDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Awards/milestones',
        });
    }
}
