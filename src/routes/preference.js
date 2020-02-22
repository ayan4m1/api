import { Router } from 'express';
import { param } from 'express-validator';

import { authenticate } from 'modules/auth';
import models from 'modules/database';
import {
  handleCount,
  handleFindAll,
  handleValidationErrors,
  handleModelOperation
} from 'modules/utils/request';

const router = Router();
const { Preference } = models;

/**
 * GET Preferences
 */
router.get('/', authenticate(), handleFindAll(Preference));

/**
 * GET Preference
 */
router.get(
  '/:id',
  authenticate(),
  [
    param('id')
      .isNumeric()
      .isInt({ min: 1 })
      .toInt()
  ],
  handleValidationErrors(),
  handleModelOperation(Preference, 'findOne', req => ({
    where: {
      id: req.params.id
    }
  }))
);

/**
 * GET Preference Count
 */
router.get('/count', authenticate(), handleCount(Preference));

export default router;
