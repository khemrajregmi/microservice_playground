import { v4 as uuidv4 } from 'uuid';
import { Appointment } from './types';

const appointments: Appointment[] = [
  {
    id: uuidv4(),
    status: 'CONFIRMED',
    facility: {
      id: uuidv4(),
      address: '123 Main St',
      city: 'Anytown',
      name: 'Anytown Medical Center',
      lat: 0,
      lng: 0,
    },
    timeSlot: {
      id: uuidv4(),
      scheduledAt: '2023-04-14T10:00:00Z',
      duration: 60,
    },
    userId: 'a2b863d4-6346-4ebc-b42b-cd92dddc7576',
  },
  {
    id: uuidv4(),
    status: 'CANCELLED',
    facility: {
      id: uuidv4(),
      address: '456 Oak Ave',
      city: 'Anytown',
      name: 'Anytown Medical Clinic',
      lat: 0,
      lng: 0,
    },
    timeSlot: {
      id: uuidv4(),
      scheduledAt: '2023-04-15T14:00:00Z',
      duration: 30,
    },
    userId: 'd512b9ac-6a80-4a08-9b0e-722449a6b68c',
  },
];

console.log(JSON.stringify(appointments));
