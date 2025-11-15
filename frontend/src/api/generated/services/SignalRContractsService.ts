/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserPressenceDto } from '../models/UserPressenceDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SignalRContractsService {
    /**
     * @returns UserPressenceDto OK
     * @throws ApiError
     */
    public static types(): CancelablePromise<UserPressenceDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/SignalRContracts',
        });
    }
}
