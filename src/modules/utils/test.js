import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import AnonymousStrategy from 'passport-anonymous';
import use from 'superagent-use';
import supertest from 'supertest';
import captureError from 'supertest-capture-error';

import logging from 'modules/logging';

const log = logging('util');

export const isTestEnvironment = () => process?.env?.NODE_ENV === 'test';

export const captureTestErrors = (app) =>
  use(supertest(app)).use(
    captureError((error, test) => {
      error.message += `\nURL: ${test.url}\nResponse: ${test.res.text}`;
    })
  );

export const tryCatch = (fn) => (done) => {
  try {
    fn(done);
  } catch (error) {
    log.error(error.message, error);
    done(error);
  }
};

export const bootstrapApp = (router) => {
  const app = express();

  passport.use(new AnonymousStrategy());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(router);

  return app;
};
