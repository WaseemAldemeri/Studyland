/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Award } from './Award';
import type { Guild } from './Guild';
import type { Session } from './Session';
export type User = {
    discordId?: string | null;
    displayName?: string;
    dateJoined?: string;
    dailyGoal?: string;
    guildId?: string | null;
    guild?: Guild;
    sessions?: Array<Session>;
    awards?: Array<Award>;
    messages?: Array<any>;
    id?: string;
    userName?: string | null;
    normalizedUserName?: string | null;
    email?: string | null;
    normalizedEmail?: string | null;
    emailConfirmed?: boolean;
    passwordHash?: string | null;
    securityStamp?: string | null;
    concurrencyStamp?: string | null;
    phoneNumber?: string | null;
    phoneNumberConfirmed?: boolean;
    twoFactorEnabled?: boolean;
    lockoutEnd?: string | null;
    lockoutEnabled?: boolean;
    accessFailedCount?: number;
};

