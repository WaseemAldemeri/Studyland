/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildDto } from '../models/GuildDto';
import type { UserPressenceDto } from '../models/UserPressenceDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuildsService {
    /**
     * @param id
     * @returns GuildDto OK
     * @throws ApiError
     */
    public static getGuild(
        id: string,
    ): CancelablePromise<GuildDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Guilds/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns UserPressenceDto OK
     * @throws ApiError
     */
    public static getGuildMembers(
        id: string,
    ): CancelablePromise<Array<UserPressenceDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Guilds/{id}/members',
            path: {
                'id': id,
            },
        });
    }
}
