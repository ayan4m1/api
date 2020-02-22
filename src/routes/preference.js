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

router.get('/', authenticate(), handleFindAll(Preference));

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

router.post('/');

router.put('/');

router.delete('/:id');

/**
 * GET Preference Count
 */
router.get('/count', authenticate(), handleCount(Preference));

export default router;
