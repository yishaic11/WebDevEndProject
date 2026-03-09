export type CreatePostDto = {
  content: string;
  photoUrl: string;
};

export type UpdatePostDto = {
  content?: string;
  photoUrl?: string;
};

export type LikePostDto = {
  postId: string;
};
