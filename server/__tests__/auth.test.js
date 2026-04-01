const request = require('supertest');
const app = require('../app');

describe('Auth Routes', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /auth/me without token returns 401', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
