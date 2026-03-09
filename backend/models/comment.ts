import mongoose, { Schema, type Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  postId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new mongoose.Schema({
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IComment>('Comment', commentSchema);
