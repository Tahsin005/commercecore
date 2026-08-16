import {
  getUserAddressesService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
} from './address.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await getUserAddressesService(req.user.id);
    return res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await createAddressService(req.user.id, req.body);
    return res.status(201).json(new ApiResponse(201, address, 'Address created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await updateAddressService(req.user.id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await deleteAddressService(req.user.id, req.params.id);
    return res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await setDefaultAddressService(req.user.id, req.params.id);
    return res.status(200).json(new ApiResponse(200, address, 'Default address updated successfully'));
  } catch (error) {
    next(error);
  }
};
