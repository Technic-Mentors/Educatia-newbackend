import Ticket from "../Modules/Tickets.js";
import nodemailer from "nodemailer";

/* =============== SMTP CONFIGURATION (Brevo) =============== */
const transporter = nodemailer.createTransport({  // ← Correct: createTransport (no 'er')
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: "9aaae0001@smtp-brevo.com", // Your Brevo account email
    pass: "xsmtpsib-3c76b8b20a7410cd44ce69aedfca586554f05ed373a6d8f3a76f98fc68ad425e-Hkgv0QdQ52IPyj0j", // Your Brevo SMTP key
  },
});

/* Verify connection on startup (optional but helpful) */
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

/* =============== GENERATE UNIQUE TICKET ID =============== */
const generateTicketId = async () => {
  const count = await Ticket.countDocuments();
  const paddedNumber = String(count + 1).padStart(5, "0");
  return `EDU-TS-2025-${paddedNumber}`;
};

/* =============== CREATE TICKET + SEND EMAIL TO USER =============== */
export const createTicket = async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || !email || !phone || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const ticketId = await generateTicketId();

    const newTicket = await Ticket.create({
      ticketId,
      name,
      email,
      phone,
      category,
      messages: [
        {
          sender: "user",
          message
        }
      ]
    });

    /* =============== SEND CONFIRMATION EMAIL TO USER =============== */
    try {
      await transporter.sendMail({
       from: '"Educatia Support" <support@educatia.pk>', // Sender address
        to: email,
        subject: `Your Support Ticket Created - ${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #009E99;">Hello ${name},</h2>
            <p>Thank you for reaching out! Your support ticket has been successfully created.</p>
            
            <div style="background: #f0f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; color: #009E99;">Your Ticket ID: <strong>${ticketId}</strong></h3>
            </div>

            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Your Message:</strong><br>"${message}"</p>

            <p>Our team will review your inquiry and get back to you <strong>within 24 hours</strong>.</p>
            <p>You can check your ticket status anytime using the Ticket ID above.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 14px;">Best regards,<br><strong>Educatia Support Team</strong></p>
          </div>
        `,
      });

      console.log(`Confirmation email sent to: ${email}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail ticket creation if email fails
    }

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: newTicket.ticketId,
      data: newTicket
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================================
   GET TICKET BY TICKET ID
================================ */
export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Get Ticket Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================================
   ADD MESSAGE (USER / ADMIN)
================================ */
export const addTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender, message, attachment } = req.body;

    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        message: "Sender and message are required"
      });
    }

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    ticket.messages.push({
      sender,
      message,
      attachment: attachment || null
    });

    if (sender === "user") {
      ticket.status = "IN PROGRESS";
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Add Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================================
   UPDATE TICKET STATUS (ADMIN)
================================ */
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["OPEN", "IN PROGRESS", "WAITING FOR USER", "RESOLVED", "CLOSED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket status updated",
      data: ticket
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================================
   GET ALL TICKETS (ADMIN)
================================ */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error("Get All Tickets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};