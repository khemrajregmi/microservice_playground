import fastify from 'fastify';
import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import {AppointemntStatus, Appointment} from "./types";

export const app = fastify();
const PORT = 3000;

// Connect to SQLite database
const dbPromise = open({
  filename: 'appointments.db',
  driver: sqlite3.Database,
});

interface AppointmentRequestBody {
  facilityId: string,
  timeSlotId: string,
  userId: string,
  status: AppointemntStatus,
}

// Define CRUD endpoints for appointments
app.get('/appointments', async (request, reply) => {
  const db = await dbPromise;
  const appointments = await db.all<Appointment[]>('SELECT * FROM appointments');
  reply.send(appointments);
});

app.get<{ Params: { id: string } }>('/appointments/:id', async (request, reply) => {
  const db = await dbPromise;
  const {id} = request.params;
  const appointment = await db.get<Appointment>('SELECT * FROM appointments WHERE id = ?', id);
  if (!appointment) {
    reply.status(404).send({message: 'Appointment not found'});
  } else {
    reply.send(appointment);
  }
});

app.post<{ Body: AppointmentRequestBody }>('/appointments', async (request, reply) => {
  const db = await dbPromise;
  const {facilityId, timeSlotId, userId} = request.body;
  const result = await db.run(
    'INSERT INTO appointments (status, facilityId, timeSlotId, userId) VALUES (?, ?, ?, ?)',
    'CONFIRMED',
    facilityId,
    timeSlotId,
    userId
  );
  const appointment = await db.get<Appointment>('SELECT * FROM appointments WHERE id = ?', result.lastID);
  reply.code(201).send(appointment);
});

app.put<{ Params: { id: string }, Body: AppointmentRequestBody }>('/appointments/:id', async (request, reply) => {
  const db = await dbPromise;
  const {id} = request.params;
  const {facilityId, timeSlotId, status} = request.body;
  const appointment = await db.get<Appointment>('SELECT * FROM appointments WHERE id = ?', id);
  if (!appointment) {
    reply.status(404).send({message: 'Appointment not found'});
  } else {
    await db.run(
      'UPDATE appointments SET status = ?, facilityId = ?, timeSlotId = ? WHERE id = ?',
      status || appointment.status,
      facilityId || appointment.facilityId,
      timeSlotId || appointment.timeSlotId,
      id
    );
    const updatedAppointment = await db.get<Appointment>('SELECT * FROM appointments WHERE id = ?', id);
    reply.send(updatedAppointment);
  }
});

app.delete<{ Params: { id: string } }>('/appointments/:id', async (request, reply) => {
  const db = await dbPromise;
  const {id} = request.params;
  const appointment = await db.get<Appointment>('SELECT * FROM appointments WHERE id = ?', id);
  if (!appointment) {
    reply.status(404).send({message: 'Appointment not found'});
  } else {
    await db.run('DELETE FROM appointments WHERE id = ?', id);
    reply.status(204).send();
  }
});

// Start the server
app.listen(PORT,"0.0.0.0", async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT,
      facilityId TEXT,
      timeSlotId TEXT,
      userId TEXT
    )
  `);
  console.log(`Server listening on port ${PORT}`);
});

export default app;
