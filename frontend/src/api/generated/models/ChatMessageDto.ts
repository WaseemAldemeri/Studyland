/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatMessageType } from './ChatMessageType';
import type { UserDto } from './UserDto';
export type ChatMessageDto = {
    id: string;
    timestamp: string;
    content: string;
    messageType: ChatMessageType;
    user: UserDto;
};

