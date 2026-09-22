import mongoose, {
    Schema,
    type Model,
  } from "mongoose";
  
  export interface IUser {
    username: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  const UserSchema = new Schema<IUser>(
    {
      username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20,
      },
  
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
  
      passwordHash: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  const User: Model<IUser> =
    mongoose.models.User ||
    mongoose.model<IUser>(
      "User",
      UserSchema
    );
  
  export default User;