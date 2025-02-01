const Message = require("../models/Message");

exports.sendMessages = async (req, res) => {
  try {
    const { title, description, type } = req.body;


    const filePaths = req.files?.length > 0 ? req.files.map(file => file.path || file.url) : null;

    const message = await Message.create({
      title,
      description,
      type,
      filePath: filePaths,
    });

    res.status(200).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

  

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find();


    res.status(200).json({ message: "Message Get successfully",messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
