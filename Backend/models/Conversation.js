  import mongoose from "mongoose";

  const conversationSchema = new mongoose.Schema(
    {
      participants: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      lastMessage: {
        content: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    },
    { timestamps: true }
  );

  export default mongoose.model("Conversation", conversationSchema);
