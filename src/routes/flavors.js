import multer from 'multer';
import neatCsv from 'neat-csv';
import { Router } from 'express';
import getStream from 'get-stream';
import Sequelize from 'sequelize';
import { createReadStream } from 'fs';
import { query, validationResult } from 'express-validator';

import { authenticate } from 'modules/auth';
import models from 'modules/database';
import loggers from 'modules/logging';

const router = Router();
const { Op } = Sequelize;
const log = loggers('flavors');
const { Flavor, Vendor, UsersFlavors } = models;

const uploads = multer({ dest: './uploads' });
const importNameRegex = /(.*) \(([a-z0-9]+)\)/i;

/**
 * GET Flavors
 * @query offset int
 * @query limit int
 */
router.get(
  '/',
  authenticate(),
  [
    query('offset')
      .optional()
      .isNumeric()
      .toInt(),
    query('limit')
      .optional()
      .isNumeric()
      .toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const limit = req.query.limit || 20;

    const offset = req.query.offset - 1 || 0;

    log.info(`request for flavors ${limit}`);
    try {
      const result = await Flavor.findAll({
        limit,
        offset,
        include: [
          {
            model: Vendor,
            require: true
          }
        ]
      });

      if (!Array.isArray(result) || result.length === 0) {
        return res.status(204).end();
      }

      res.type('application/json');
      res.json(result);
    } catch (error) {
      log.error(error.message);
      res.status(500).send(error.message);
    }
  }
);
/**
 * Import flavor stash CSV
 */
router.put(
  '/import',
  authenticate(),
  uploads.single('csv'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).end();
    }

    const { size, path } = req.file;

    if (size > 256000) {
      return res.status(413).end();
    }

    try {
      const stream = createReadStream(path);
      const data = await getStream(stream);
      const parsed = await neatCsv(data, {
        separator: ';'
      });
      const vendorCache = [];

      let insertCount = 0;

      for (const entry of parsed) {
        const { Flavor: rawName } = entry;
        const matches = rawName.match(importNameRegex);

        if (!matches) {
          continue;
        }

        const [, name, rawVendor] = matches;
        const vendorSlug = rawVendor.toLowerCase();

        let vendor = vendorCache.find(vend => vend.code === vendorSlug);

        if (!vendor) {
          vendor = await Vendor.findOne({
            where: {
              [Op.or]: {
                code: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('code')),
                  '=',
                  vendorSlug
                ),
                name: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('name')),
                  '=',
                  vendorSlug
                )
              }
            }
          });

          if (!vendor) {
            log.warn(`Failed to find ${vendorSlug}`);
            continue;
          }

          vendorCache.push(vendor);
        }

        const flavor = await Flavor.findOne({
          where: {
            [Op.and]: {
              name: {
                [Op.iLike]: `%${name}%`
              },
              vendorId: vendor.id
            }
          }
        });

        if (!flavor) {
          log.warn(`Failed to find ${name}`);
          continue;
        }

        try {
          await UsersFlavors.create({
            userId: req.user.id,
            flavorId: flavor.id
          });
        } catch (error) {
          log.error(error.message);
        }
        insertCount++;
      }

      const successPercentage = ((insertCount / parsed.length) * 100).toFixed(
        2
      );

      log.info(
        `Successfully imported ${successPercentage}% of ${parsed.length} records!`
      );
    } catch (error) {
      log.error(error.message);
    }

    res.status(204).end();
  }
);

/**
 * GET Flavor Stats
 */
router.get('/count', authenticate(), async (req, res) => {
  log.info(`request for flavor stats`);
  try {
    // Flavor Stats
    const result = await Flavor.count();

    res.type('application/json');
    res.json(result);
  } catch (error) {
    log.error(error.message);
    res.status(500).send(error.message);
  }
});

export default router;
