import Address from './address.model.js';
import ApiError from '../../utils/ApiError.js';

export const getUserAddressesService = async (userId) => {
  return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const createAddressService = async (userId, payload) => {
  const existingCount = await Address.countDocuments({ userId });
  let isDefault = payload.isDefault || existingCount === 0;

  if (isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const address = await Address.create({
    userId,
    label: payload.label || 'Home',
    fullAddress: payload.fullAddress,
    city: payload.city || 'Dhaka',
    isDefault,
  });

  return address;
};

export const updateAddressService = async (userId, addressId, payload) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (payload.isDefault) {
    await Address.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
  } else if (payload.isDefault === false && address.isDefault) {
    const other = await Address.findOne({ userId, _id: { $ne: addressId } }).sort({ createdAt: -1 });
    if (other) {
      other.isDefault = true;
      await other.save();
    } else {
      payload.isDefault = true;
    }
  }

  if (payload.label !== undefined) address.label = payload.label;
  if (payload.fullAddress !== undefined) address.fullAddress = payload.fullAddress;
  if (payload.city !== undefined) address.city = payload.city;
  if (payload.isDefault !== undefined) address.isDefault = payload.isDefault;

  await address.save();
  return address;
};

export const deleteAddressService = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const wasDefault = address.isDefault;
  await Address.deleteOne({ _id: addressId, userId });

  // If deleted address was default, set the latest remaining address as default
  if (wasDefault) {
    const latest = await Address.findOne({ userId }).sort({ createdAt: -1 });
    if (latest) {
      latest.isDefault = true;
      await latest.save();
    }
  }

  return true;
};

export const setDefaultAddressService = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await Address.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  return address;
};
