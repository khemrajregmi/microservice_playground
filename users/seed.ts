import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

const users: User[] = [
  {
    id: uuidv4(),
    name: 'Alice',
    email: 'alice@example.com',
    appointments: [],
    results: [],
  },
  {
    id: uuidv4(),
    name: 'Bob',
    email: 'bob@example.com',
    appointments: [],
    results: [],
  },
];

console.log(JSON.stringify(users));
