/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyHours } from './DailyHours';
import type { TopicSlice } from './TopicSlice';
export type RecapDto = {
    period: string;
    startDate: string;
    endDate: string;
    totalHours: number;
    totalSessions: number;
    daysStudied: number;
    averageSessionMinutes: number;
    previousPeriodHours: number;
    deltaHours: number;
    currentStreakDays: number;
    bestDayDate?: string | null;
    bestDayHours: number;
    topTopics: Array<TopicSlice>;
    dailyBreakdown: Array<DailyHours>;
};

