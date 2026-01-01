import mongoose from "mongoose";
const { Schema } = mongoose;

/* ===========================
   Ticket Messages Schema
=========================== */
const ticketMessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachment: {
      type: String, // file URL or file name
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* ===========================
   Ticket Main Schema
=========================== */
const ticketSchema = new Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        "Admission",
        "Visa",
        "Scholarship",
        "Application Status",
        "General Inquiry"
      ],
      required: true
    },

    status: {
      type: String,
      enum: ["OPEN", "IN PROGRESS", "WAITING FOR USER", "RESOLVED", "CLOSED"],
      default: "OPEN"
    },

    messages: [ticketMessageSchema],

    assignedTo: {
      type: String, // counselor/admin name or ID
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* ===========================
   Export Model
=========================== */
export default mongoose.model("Ticket", ticketSchema);
