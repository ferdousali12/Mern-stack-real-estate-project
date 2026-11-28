import { isValidObjectId } from "mongoose";
import Listing from "../model/listing.model.js";
import { errorHandler } from "../error.js";

const toBoolean = (value) => value === true || value === "true";

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const normalizeImages = (images) => {
  if (Array.isArray(images)) {
    return images.map((image) => String(image).trim()).filter(Boolean);
  }

  if (typeof images === "string") {
    return images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);
  }

  return [];
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateListing = (data) => {
  const requiredFields = ["name", "description", "address", "beds", "baths", "type"];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      return `${field} is required`;
    }
  }

  const regularPrice = Number(data.regularPrice);
  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    return "regularPrice must be greater than 0";
  }

  const discountPrice = toNumberOrUndefined(data.discountPrice);
  if (discountPrice !== undefined) {
    if (discountPrice <= 0) {
      return "discountPrice must be greater than 0";
    }

    if (discountPrice >= regularPrice) {
      return "discountPrice must be less than regularPrice";
    }
  }

  const beds = Number(data.beds);
  if (!Number.isFinite(beds) || beds < 1) {
    return "beds must be at least 1";
  }

  const baths = Number(data.baths);
  if (!Number.isFinite(baths) || baths < 1) {
    return "baths must be at least 1";
  }

  if (!["rent", "sale"].includes(data.type)) {
    return "type must be rent or sale";
  }

  return null;
};

const buildListingData = (data, userRef) => {
  const listingData = {
    name: String(data.name).trim(),
    description: String(data.description).trim(),
    address: String(data.address).trim(),
    regularPrice: Number(data.regularPrice),
    discountPrice: toNumberOrUndefined(data.discountPrice),
    beds: Number(data.beds),
    baths: Number(data.baths),
    furnished: toBoolean(data.furnished),
    parking: toBoolean(data.parking),
    type: data.type,
    offer: toBoolean(data.offer),
    images: normalizeImages(data.images),
  };

  if (userRef) {
    listingData.userRef = userRef;
  }

  return listingData;
};

const getOwnerId = (listing) =>
  typeof listing.userRef === "string" ? listing.userRef : listing.userRef?._id?.toString();

const validateListingId = (id) =>
  isValidObjectId(id) ? null : errorHandler(404, "Listing not found");

export const createListing = async (req, res, next) => {
  try {
    const validationMessage = validateListing(req.body);

    if (validationMessage) {
      return next(errorHandler(400, validationMessage));
    }

    if (
      mergedData.type === "sale" &&
      !["agent", "admin"].includes(req.authUser.role)
    ) {
      return next(errorHandler(403, "Only agents and admins can manage sale listings"));
    }

    if (
      mergedData.type === "rent" &&
      !["owner", "agent", "admin"].includes(req.authUser.role)
    ) {
      return next(errorHandler(403, "Only owners, agents, and admins can manage rent listings"));
    }

    const role = req.authUser.role;
    const listingType = req.body.type;

    if (listingType === "sale" && !["agent", "admin"].includes(role)) {
      return next(errorHandler(403, "Only agents and admins can create sale listings"));
    }

    if (listingType === "rent" && !["owner", "agent", "admin"].includes(role)) {
      return next(errorHandler(403, "Only owners, agents, and admins can create rent listings"));
    }

    const listing = new Listing(buildListingData(req.body, req.user.id));
    await listing.save();

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const idError = validateListingId(req.params.id);
    if (idError) return next(idError);

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const requestedLimit = toNumberOrUndefined(req.query.limit) ?? 12;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);
    const startIndex = Math.max(toNumberOrUndefined(req.query.startIndex) ?? 0, 0);

    const offer = ["true", "false"].includes(req.query.offer)
      ? req.query.offer === "true"
      : undefined;
    const furnished = ["true", "false"].includes(req.query.furnished)
      ? req.query.furnished === "true"
      : undefined;
    const parking = ["true", "false"].includes(req.query.parking)
      ? req.query.parking === "true"
      : undefined;
    const type = ["rent", "sale"].includes(req.query.type) ? req.query.type : undefined;

    const minPrice = toNumberOrUndefined(req.query.minPrice);
    const maxPrice = toNumberOrUndefined(req.query.maxPrice);
    const beds = toNumberOrUndefined(req.query.beds);
    const baths = toNumberOrUndefined(req.query.baths);

    const searchTerm =
      typeof req.query.searchTerm === "string" ? req.query.searchTerm.trim() : "";

    const query = {};

    if (offer !== undefined) query.offer = offer;
    if (furnished !== undefined) query.furnished = furnished;
    if (parking !== undefined) query.parking = parking;
    if (type) query.type = type;
    if (beds !== undefined) query.beds = { $gte: beds };
    if (baths !== undefined) query.baths = { $gte: baths };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.regularPrice = {};

      if (minPrice !== undefined) query.regularPrice.$gte = minPrice;
      if (maxPrice !== undefined) query.regularPrice.$lte = maxPrice;
    }

    if (searchTerm) {
      const pattern = new RegExp(escapeRegex(searchTerm), "i");
      query.$or = [
        { name: { $regex: pattern } },
        { description: { $regex: pattern } },
        { address: { $regex: pattern } },
      ];
    }

    const sortOptions = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc: { createdAt: 1 },
      price_asc: { regularPrice: 1 },
      price_desc: { regularPrice: -1 },
    };

    const sort =
      sortOptions[req.query.sort] || sortOptions.createdAt_desc;

    const listings = await Listing.find(query)
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    const total = await Listing.countDocuments(query);

    res.status(200).json({ listings, total });
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const idError = validateListingId(req.params.id);
    if (idError) return next(idError);

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (req.authUser.role !== "admin" && req.user.id !== getOwnerId(listing)) {
      return next(errorHandler(403, "You can only edit your own listings"));
    }

    const mergedData = { ...listing.toObject(), ...req.body };
    const validationMessage = validateListing(mergedData);

    if (validationMessage) {
      return next(errorHandler(400, validationMessage));
    }

    const updateData = buildListingData(mergedData);
    const unsetData = {};

    if (
      Object.prototype.hasOwnProperty.call(req.body, "discountPrice") &&
      updateData.discountPrice === undefined
    ) {
      delete updateData.discountPrice;
      unsetData.discountPrice = "";
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
        ...(Object.keys(unsetData).length > 0 ? { $unset: unsetData } : {}),
      },
      { new: true },
    );

    res.status(200).json(updatedListing);
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const idError = validateListingId(req.params.id);
    if (idError) return next(idError);

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (req.authUser.role === "owner" && listing.type !== "rent") {
      return next(errorHandler(403, "Owners can only manage rent listings"));
    }

    if (req.authUser.role !== "admin" && req.user.id !== getOwnerId(listing)) {
      return next(errorHandler(403, "You can only delete your own listings"));
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json("Listing deleted");
  } catch (err) {
    next(err);
  }
};
