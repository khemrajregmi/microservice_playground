export interface Appointment {
  id: number | null,
  userId: string,
  timeSlotId: string,
  facilityId: string,
  status: AppointemntStatus
}

export enum AppointemntStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}