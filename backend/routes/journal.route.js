import { Router } from "express";
import { 
  createJournalEntry, 
  getUserJournalEntries,
  getRecentJournalEntries,
  updateJournalEntry, 
  deleteJournalEntry 
} from "../controllers/journal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const journalRouter = Router();

// POST /journal/create - Create a new journal entry (protected route)
journalRouter.post("/create", verifyJWT, createJournalEntry);

// GET /journal - Get all journal entries for the authenticated user (protected route)
journalRouter.get("/", verifyJWT, getUserJournalEntries);

// GET /journal/recent - Get recent journal entries with search and sort (protected route)
journalRouter.get("/recent", verifyJWT, getRecentJournalEntries);

// PUT /journal/:id - Update a journal entry (protected route)
journalRouter.put("/:id", verifyJWT, updateJournalEntry);

// DELETE /journal/:id - Delete a journal entry (protected route)
journalRouter.delete("/:id", verifyJWT, deleteJournalEntry);

export { journalRouter };