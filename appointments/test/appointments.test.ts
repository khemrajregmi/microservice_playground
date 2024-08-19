import {AppointemntStatus, Appointment} from '../src/types';
import app from "../src";

const testAppointment: Appointment = {
  id: 1,
  status: AppointemntStatus.CONFIRMED,
  facilityId: '4e4e4c12-0f4a-4da3-a3f1-c8f3e2ee9c3d',
  timeSlotId: '432d0b5c-0675-43f9-a49b-59e4dc8cb1db',
  userId: '2f47eb96-7193-4d3d-8c57-af7771c71db7',
};


describe('appointments microservice', () => {
  afterAll(async () => {
    await app.close();
  })

  it('should create a new appointment', async () => {
    const res = await app.inject({url: '/appointments', method: "POST", payload: testAppointment});
    expect(res.statusCode).toBe(201);
  });

  it('should retrieve a list of all appointments for a user', async () => {
    const res = await app.inject({url: '/appointments'})
    expect(res.statusCode).toBe(200);
  });

  it('should retrieve a specific appointment by ID', async () => {
    const res = await app.inject(`/appointments/1`)
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject(testAppointment);
  });

  it('should update an existing appointment', async () => {
    const updatedAppointment: Appointment = {
      ...testAppointment,
      status: AppointemntStatus.CANCELLED,
    };

    const res = await app.inject({
      url: `/appointments/${testAppointment.id}`,
      method: "PUT",
      payload: updatedAppointment
    });

    expect(res.json()).toMatchObject(updatedAppointment);
  });

  it('should delete an existing appointment', async () => {
    const res = await app
      .inject({url: `appointments/${testAppointment.id}`, method: "DELETE"})
    expect(res.statusCode).toBe(204);
  });
});
