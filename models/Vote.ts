import mongoose, { Schema, type Model } from "mongoose";

export type ParticipantType = "host" | "guest";

export interface IVote {
  roomId: mongoose.Types.ObjectId;
  foodId: string;
  voterToken: string;
  participantType: ParticipantType;
  createdAt?: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    foodId: {
      type: String,
      required: true,
    },

    voterToken: {
      type: String,
      required: true,
    },

    participantType: {
      type: String,
      enum: ["host", "guest"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
  같은 브라우저에서 같은 방에 중복 투표하는 것을 막기 위한 제약
*/
VoteSchema.index(
  { roomId: 1, voterToken: 1 },
  { unique: true }
);

const Vote: Model<IVote> =
  mongoose.models.Vote ||
  mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;