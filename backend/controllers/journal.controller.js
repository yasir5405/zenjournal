import { journalModel } from "../models/journal.model.js";
import { journalEntrySchema, updateJournalEntrySchema } from "../utils/validation.js";

export const getRecentJournalEntries = async (req, res, next) => {
  try {
    const userId = req.userId; // From JWT middleware

    // Additional security check - ensure userId exists
    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Default to 12 for grid layout
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sort = req.query.sort || "newest";

    // Build the search query
    let searchQuery = { user: userId };

    // Add search functionality if search term is provided
    if (search.trim()) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
        { content: { $regex: search, $options: 'i' } } // Case-insensitive search in content
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 }; // Ascending (oldest first)
        break;
      case 'title':
        sortOptions = { title: 1, createdAt: -1 }; // A-Z sorting by title, then by creation date
        break;
      case 'updated':
        sortOptions = { updatedAt: -1, createdAt: -1 }; // Recently updated first, then by creation
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 }; // Descending (newest first) - default
        break;
    }

    // Find recent journal entries with search and sort
    const journalEntries = await journalModel
      .find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("user", "-password");

    // Get total count for pagination info (with search applied)
    const totalEntries = await journalModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalEntries / limit);

    res.status(200).json({
      status: true,
      message: "Recent journal entries retrieved successfully.",
      data: {
        entries: journalEntries,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalEntries: totalEntries,
          entriesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          search: search,
          sort: sort
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createJournalEntry = async (req, res, next) => {
  try {
    // Validate the request body
    const parsedBody = journalEntrySchema.safeParse(req.body);

    if (!parsedBody.success) {
      const error = new Error(parsedBody.error.issues[0].message);
      error.statusCode = 400;
      return next(error);
    }

    const { title, content } = parsedBody.data;
    const userId = req.userId; // From JWT middleware

    // Create the journal entry
    const journalEntry = await journalModel.create({
      title,
      content,
      user: userId,
    });

    // Populate user information (excluding password)
    await journalEntry.populate("user", "-password");

    res.status(201).json({
      status: true,
      message: "Journal entry created successfully.",
      entry: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserJournalEntries = async (req, res, next) => {
  try {
    const userId = req.userId; // From JWT middleware

    // Additional security check - ensure userId exists
    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sort = req.query.sort || "newest";

    // Build the search query
    let searchQuery = { user: userId };

    // Add search functionality if search term is provided
    if (search.trim()) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
        { content: { $regex: search, $options: 'i' } } // Case-insensitive search in content
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 }; // Ascending (oldest first)
        break;
      case 'title':
        sortOptions = { title: 1 }; // A-Z sorting by title
        break;
      case 'updated':
        sortOptions = { updatedAt: -1 }; // Recently updated first
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 }; // Descending (newest first) - default
        break;
    }

    // Find journal entries with search and sort
    const journalEntries = await journalModel
      .find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("user", "-password");

    // Get total count for pagination info (with search applied)
    const totalEntries = await journalModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalEntries / limit);

    res.status(200).json({
      status: true,
      message: "Journal entries retrieved successfully.",
      data: {
        entries: journalEntries,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalEntries: totalEntries,
          entriesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          search: search,
          sort: sort
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Additional security check - ensure userId exists (should be set by verifyJWT middleware)
    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Validate the request body
    const parsedBody = updateJournalEntrySchema.safeParse(req.body);

    if (!parsedBody.success) {
      const error = new Error(parsedBody.error.issues[0].message);
      error.statusCode = 400;
      return next(error);
    }

    // Find the journal entry
    const journalEntry = await journalModel.findById(id);

    if (!journalEntry) {
      const error = new Error("Journal entry not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Check if the user owns this entry
    if (!journalEntry.user.equals(userId)) {
      const error = new Error("You are not authorized to update this entry.");
      error.statusCode = 403;
      return next(error);
    }

    // Update the entry
    const updateData = parsedBody.data;
    const updatedEntry = await journalModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("user", "-password");

    res.status(200).json({
      status: true,
      message: "Journal entry updated successfully.",
      entry: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Additional security check - ensure userId exists (should be set by verifyJWT middleware)
    if (!userId) {
      const error = new Error("Authentication required. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    // Find the journal entry
    const journalEntry = await journalModel.findById(id);

    if (!journalEntry) {
      const error = new Error("Journal entry not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Check if the user owns this entry
    if (!journalEntry.user.equals(userId)) {
      const error = new Error("You are not authorized to delete this entry.");
      error.statusCode = 403;
      return next(error);
    }

    // Delete the entry
    await journalModel.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Journal entry deleted successfully.",
      deletedEntryId: id,
    });
  } catch (error) {
    next(error);
  }
};