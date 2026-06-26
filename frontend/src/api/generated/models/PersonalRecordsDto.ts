/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TopicDto } from './TopicDto';
export type PersonalRecordsDto = {
    currentStreakDays: number;
    longestStreakDays: number;
    totalHours: number;
    totalSessions: number;
    daysStudied: number;
    averageSessionMinutes: number;
    longestSessionMinutes: number;
    longestSessionDate?: string | null;
    longestSessionTopic?: TopicDto;
    bestDayHours: number;
    bestDayDate?: string | null;
    bestWeekHours: number;
    bestWeekStart?: string | null;
    favoriteTopic?: TopicDto;
    favoriteTopicHours: number;
    firstSessionDate?: string | null;
};

