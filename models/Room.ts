import mongoose, { Schema, type Model } from "mongoose";

export type RoomStatus = "voting" | "tiebreak" | "finished";

export interface IRoom {
  candidateFoodIds: string[];
  preferenceAnswers: string[];
  shareToken: string;
  status: RoomStatus;
  finalFoodId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    candidateFoodIds: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 2,
        message: "후보 음식은 정확히 2개여야 합니다.",
      },
    },

    preferenceAnswers: {
      type: [String],
      required: true,
    },

    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["voting", "tiebreak", "finished"],
      default: "voting",
      required: true,
    },

    finalFoodId: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

const Room: Model<IRoom> =
  mongoose.models.Room ||
  mongoose.model<IRoom>("Room", RoomSchema);

export default Room;