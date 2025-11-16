/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PressenceStatus } from './PressenceStatus';
import type { TopicDto } from './TopicDto';
import type { UserDto } from './UserDto';
export type UserPressenceDto = {
    user: UserDto;
    status: PressenceStatus;
    topic?: TopicDto;
    startedAt: string;
};

