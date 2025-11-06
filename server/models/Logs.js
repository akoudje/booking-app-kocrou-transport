import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["login", "trajet_update", "trajet_delete", "reservation_cancel"],
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
