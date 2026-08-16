import express from 'express';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './address.controller.js';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from './address.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUserAddresses);
router.post('/', validate(createAddressSchema), createAddress);
router.put('/:id', validate(updateAddressSchema), updateAddress);
router.delete('/:id', validate(addressIdParamSchema), deleteAddress);
router.patch('/:id/default', validate(addressIdParamSchema), setDefaultAddress);

export default router;
