import mongoose from 'mongoose';
import Post from '../models/post';

export const handlePostLikeToggle = async (postId: string, userId: string): Promise<void> => {
  try {
    const post = await Post.findById(postId);
    if (!post) throw new Error(`Post not found for Id: ${postId}`);

    const userIdObject = new mongoose.Types.ObjectId(userId);
    const userAlreadyLikesPost = post.likes.some((id) => id.equals(userIdObject));

    if (userAlreadyLikesPost) {
      post.likes = post.likes.filter((id) => !id.equals(userIdObject));
    } else {
      post.likes.push(userIdObject);
    }

    await post.save();
  } catch (error) {
    throw new Error(
      `Failed to toggle like for post Id: ${postId} and user Id: ${userId}. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
