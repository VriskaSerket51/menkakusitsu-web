import type * as models from './generated/models';
export type * from './generated/models';

export type AttendanceList = models.AttendanceListSuccess['list'];
export type BbsComment = models.BbsCommentListSuccess['list'][number];
export type BbsPost = models.BbsPostSuccess['post'];
export type FileInfo = models.BbsPostSuccess['attachments'][number];
export type LocationInfo = models.LocationInfoSuccess['locationInfo'][number];
export type MealInfo = models.MealSuccess['breakfast'];
export type PurposeInfo = models.PurposeInfoSuccess['purposeInfo'][number];
export type SpecialroomInfo = models.SpecialroomApplySuccess['specialroomInfo'];
export type Timetable = models.TimetableSuccess['timetable'];
export type TimetableCell = models.TimetableSuccess['timetable']['timetableInfo'][number][number];
export type UserInfo = models.StudentInfoSuccess['studentInfo'][number];
