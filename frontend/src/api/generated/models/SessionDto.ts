/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TopicDto } from './TopicDto';
import type { UserDto } from './UserDto';
export type SessionDto = {
    id: string;
    startedAt: string;
    durationMS: string;
    topic: TopicDto;
    user: UserDto;
};

