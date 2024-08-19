import fastify, {FastifyInstance, FastifyRequest} from 'fastify';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Appointment {
  id: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  facilityId: string,
  timeSlotId: string,
  userId: string
}

interface Result {
  id: string;
  date: string;
  notes?: string;
  inRange: number;
  outOfRange: number;
  seenAt?: string;
}

interface AppointmentRequest extends FastifyRequest {
  Params: {
    id: string;
  };
  Body: Appointment;
}

interface UserRequest extends FastifyRequest {
  Params: {
    id: string;
  };
}

// initialize Fastify app
const app: FastifyInstance = fastify({logger: true});


// define routes
app.post<AppointmentRequest>('/users/:id/appointments', async (req) => {
  throw new Error('Not Implemented');
});

app.get<UserRequest>('/users/:id/appointments', async (req) => {
  throw new Error('Not Implemented');
});

app.get<UserRequest>('/users/:id/results', async (req) => {
  throw new Error('Not Implemented');
});

// start the server
const start = async () => {
  try {
    await app.listen(3000, "0.0.0.0")
    console.log(`Server listening on ${app.server.address()}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

export default app;