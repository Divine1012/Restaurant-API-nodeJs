import request from "supertest";
import app from "../src/server.js";
import { connectTestDB, clearCollections, closeTestDB } from "./setup-db.js";
import { User, Restaurant } from "../src/mongo.js";
import { connectDB } from "../src/mongo.js";

beforeAll(async () => {
  await connectDB();
});

async function adminToken() {
  await request(app).post("/users/register").send({
    email: "admin@mail.com", username: "admin", password: "123456"
  });
  await User.updateOne({ email: "admin@mail.com" }, { $set: { role: "admin" } });
  const login = await request(app).post("/users/login").send({
    email: "admin@mail.com", password: "123456"
  });
  return login.body.token;
}

beforeAll(async () => { await connectTestDB(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeTestDB(); });

test("CRUD menu (admin)", async () => {
  const token = await adminToken();
  const resto = await Restaurant.create({
    name: "R1", address: "A", phone: "000", opening_hours: "9-18"
  });

  const created = await request(app)
    .post("/menus")
    .set("Authorization", `Bearer ${token}`)
    .send({ restaurant_id: resto._id, name: "Menu Midi", price: 12.5, category: "main" });
  expect(created.status).toBe(201);

  const id = (created.body && (created.body._id || created.body.id)) || created.body?.item?._id;
  expect(id).toBeDefined();

  const got = await request(app).get(`/menus/${id}`);
  expect(got.status).toBe(200);

  const updated = await request(app)
    .put(`/menus/${id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ price: 13.0 });
  expect(updated.status).toBe(200);

  const del = await request(app)
    .delete(`/menus/${id}`)
    .set("Authorization", `Bearer ${token}`);
  expect(del.status).toBe(200);
});