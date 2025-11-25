/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatChannel2 } from './ChatChannel2';
import type { ChatMessageType } from './ChatMessageType';
import type { User2 } from './User2';
export type ChatMessage = {
    id?: string;
    timestamp?: string;
    content: string;
    messageType?: ChatMessageType;
    channelId: string;
    channel?: ChatChannel2;
    userId: string;
    user?: User2;
};

