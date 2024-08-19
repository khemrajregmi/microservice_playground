import app from "../src";
import {randomUUID} from "crypto";

const testAppointment = {
  userId: randomUUID(),
  timeSlotId: randomUUID(),
  facilityId: randomUUID(),
}

describe('users microservice', () => {

  afterAll(async ()=>{
    await app.close();
  });

  it('should create an appointment for a user', async () => {
    const res = await app
      .inject({url:'/users/:id/appointments', method:"POST", payload:{}})
    expect(res.statusCode).toBe(200);
  });

  it('should retrieve a list of all users appointments', async () => {
    const res = await app
      .inject('/users/1/appointments')
    expect(res.statusCode).toBe(200);
  });

});
