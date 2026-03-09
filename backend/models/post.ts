import mongoose, { Schema, type Document } from 'mongoose';

export interface IPost extends Document {
  content: string;
  photoUrl: string;
  senderId: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
}

const postSchema: Schema<IPost> = new mongoose.Schema({
  content: { type: String, required: true },
  photoUrl: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
});

export default mongoose.model<IPost>('Post', postSchema);
