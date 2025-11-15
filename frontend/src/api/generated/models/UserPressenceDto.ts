/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PressenceStatus } from './PressenceStatus';
import type { TopicDto2 } from './TopicDto2';
import type { UserDto } from './UserDto';
export type UserPressenceDto = {
    user: UserDto;
    status?: PressenceStatus;
    topic?: TopicDto2;
    startedAt?: string;
};

