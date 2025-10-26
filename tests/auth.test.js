import request from "supertest";
import app from "../src/server.js";
import { connectTestDB, clearCollections, closeTestDB } from "./setup-db.js";
import { connectDB } from "../src/mongo.js";

beforeAll(async () => {
  await connectDB();
});

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeTestDB(); });

describe("Auth flow", () => {
  test("register then login returns a JWT", async () => {
    const reg = await request(app).post("/users/register").send({
      email: "dave@mail.com",
      username: "dave",
      password: "123456"
    });
    expect([200,201]).toContain(reg.status);

    const login = await request(app).post("/users/login").send({
      email: "dave@mail.com",
      password: "123456"
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});