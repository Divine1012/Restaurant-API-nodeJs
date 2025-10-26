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

test("GET /my_account requires Bearer token and returns current user", async () => {
  await request(app).post("/users/register").send({
    email: "u@mail.com", username: "u", password: "123456"
  });
  const login = await request(app).post("/users/login").send({
    email: "u@mail.com", password: "123456"
  });
  const token = login.body.token;

  const noTok = await request(app).get("/my_account");
  expect([401,403]).toContain(noTok.status);

  const me = await request(app).get("/my_account")
    .set("Authorization", `Bearer ${token}`);
  expect(me.status).toBe(200);
  expect(me.body.email).toBe("u@mail.com");
});