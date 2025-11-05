/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyActivity } from './DailyActivity';
import type { UserKpiStats } from './UserKpiStats';
import type { UserTopicBreakDown } from './UserTopicBreakDown';
export type StatsDto = {
    dailyActivities: Array<DailyActivity>;
    usersKpis: Array<UserKpiStats>;
    usersTopicBreakDowns: Array<UserTopicBreakDown>;
    startDate: string;
    endDate: string;
    totalDays: number;
};

