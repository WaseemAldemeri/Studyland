/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequestDto } from '../models/LoginRequestDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { RegisterRequestDto } from '../models/RegisterRequestDto';
import type { UserDto } from '../models/UserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountService {
    /**
     * @param requestBody
     * @returns LoginResponseDto OK
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequestDto,
    ): CancelablePromise<LoginResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Account/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Account/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static logout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Account/logout',
        });
    }
    /**
     * @returns UserDto OK
     * @throws ApiError
     */
    public static userInfo(): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Account',
        });
    }
}
