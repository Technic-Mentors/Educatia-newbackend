import express from "express";
import {
  createTicket,
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
  getAllTickets
} from "../Controllers/ticketController.js";

const router = express.Router();

/* ===============================
   Ticket Routes
=============================== */

// Create Ticket (User)
router.post("/create", createTicket);

// Get Single Ticket by Ticket ID (User / Admin)
router.get("/:ticketId", getTicketById);

// Add Message to Ticket (User / Admin)
router.post("/reply/:ticketId", addTicketMessage);

// Update Ticket Status (Admin)
router.put("/status/:ticketId", updateTicketStatus);

// Get All Tickets (Admin)
router.get("/", getAllTickets);

export default router;
