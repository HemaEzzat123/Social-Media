const Ticket = require("../models/Ticket");

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const ticketsWithMediaUrl = tickets.map((ticket) => {
      if (ticket.media) {
        ticket.media = `${req.protocol}://${req.get("host")}/uploads/${
          ticket.media
        }`;
      }
      return ticket;
    });

    res.status(200).json(ticketsWithMediaUrl);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Failed to retrieve tickets" });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const media = { photo: null, video: null };

    // Process uploaded files
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        media.photo = req.files.photo[0].filename;
      }
      if (req.files.video && req.files.video[0]) {
        media.video = req.files.video[0].filename;
      }
      // If "media" field is used, determine type and store appropriately
      if (req.files.media && req.files.media[0]) {
        const file = req.files.media[0];
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        
        if (isImage) media.photo = file.filename;
        if (isVideo) media.video = file.filename;
      }
    }

    const newTicket = new Ticket({
      name,
      email,
      message,
      media, // Now saving as an object with photo and video properties
    });

    await newTicket.save();

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
};
