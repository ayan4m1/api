import preferenceRoute from './preference';
import database from 'modules/database';
import { captureTestErrors, tryCatch, bootstrapApp } from 'modules/utils/test';

describe('preference route resource', () => {
  const app = bootstrapApp(preferenceRoute);
  const request = captureTestErrors(app);

  afterAll(() => Promise.all(database.sequelize.close(), app.close()));

  it('can request valid preference', () => {
    tryCatch(done => {
      request
        .get('/1')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  it('returns 400 for invalid number in GET request', () => {
    tryCatch(done => {
      request
        .get('/0')
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
  });

  it('returns 400 for string in GET request', () => {
    tryCatch(done => {
      request
        .get('/ham')
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
  });
});
