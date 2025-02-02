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
    let { page = 1, limit = 10, title } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};
    if (title) filter.title = { $regex: title, $options: "i" }; 

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);

    const totalMessages = await Message.countDocuments(filter);

    res.status(200).json({
      message: "Messages retrieved successfully",
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      totalMessages,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatusMessage=async(req,res)=>{
  try {
    const id=req.params.id;
    const messages = await Message.findById(id);
    messages.status="resolved";
    messages.save()
    res.status(200).json({ message: "Message status updated successfully",messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
