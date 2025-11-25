/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Topic } from './Topic';
import type { User2 } from './User2';
export type Session = {
    id?: string;
    startedAt: string;
    duration: string;
    userId: string;
    user?: User2;
    topicId: string;
    topic?: Topic;
};

