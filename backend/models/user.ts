import mongoose, { type Document, type Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  photoUrl?: string;
  googleId?: string;
  refreshTokens: string[];
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  photoUrl: { type: String },
  googleId: { type: String, sparse: true },
  refreshTokens: { type: [String], default: [] },
});

export default mongoose.model<IUser>('User', userSchema);
