import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "participantModel",
      },
    ],
    participantModel: {
      type: String,
      enum: ["User", "Doctor"],
      required: true,
    },
    lastMessage: String,
    lastMessageTime: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
