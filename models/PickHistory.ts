import mongoose, {
    Schema,
    type Model,
  } from "mongoose";
  
  export interface IPickHistory {
    userId: mongoose.Types.ObjectId;
    shareToken: string;
    foodId: string;
    foodName: string;
    decidedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  const PickHistorySchema =
    new Schema<IPickHistory>(
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
  
        shareToken: {
          type: String,
          required: true,
        },
  
        foodId: {
          type: String,
          required: true,
        },
  
        foodName: {
          type: String,
          required: true,
        },
  
        decidedAt: {
          type: Date,
          default: Date.now,
        },
      },
      {
        timestamps: true,
      }
    );
  
  /*
    같은 사용자가 같은 먹픽 방 결과를
    새로고침할 때마다 중복 저장되지 않도록 방지
  */
  PickHistorySchema.index(
    {
      userId: 1,
      shareToken: 1,
    },
    {
      unique: true,
    }
  );
  
  const PickHistory: Model<IPickHistory> =
    mongoose.models.PickHistory ||
    mongoose.model<IPickHistory>(
      "PickHistory",
      PickHistorySchema
    );
  
  export default PickHistory;