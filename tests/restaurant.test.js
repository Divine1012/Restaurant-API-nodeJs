import request from "supertest";
import app from "../src/server.js";
import { connectTestDB, clearCollections, closeTestDB } from "./setup-db.js";
import { User } from "../src/mongo.js";
import { connectDB } from "../src/mongo.js";

beforeAll(async () => {
  await connectDB();
});

async function createAdminAndLogin() {
  await request(app).post("/users/register").send({
    email: "admin@mail.com",
    username: "admin",
    password: "123456"
  });
  await User.updateOne({ email: "admin@mail.com" }, { $set: { role: "admin" } });
  const res = await request(app).post("/users/login").send({
    email: "admin@mail.com",
    password: "123456"
  });
  return res.body.token;
}

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeTestDB(); });

describe("Restaurants", () => {
  test("GET /restaurants is public", async () => {
    const res = await request(app).get("/restaurants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /restaurants requires admin token", async () => {
    const noTok = await request(app).post("/restaurants").send({
      name: "R1", address: "A", phone: "000", opening_hours: "9-18"
    });
    expect([401,403]).toContain(noTok.status);

    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "R1", address: "A", phone: "000", opening_hours: "9-18" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("R1");
  });
});