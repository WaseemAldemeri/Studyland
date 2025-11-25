/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatMessage } from './ChatMessage';
import type { Guild } from './Guild';
export type ChatChannel = {
    id?: string;
    name: string;
    guildId: string;
    guild?: Guild;
    messages?: Array<ChatMessage>;
};

