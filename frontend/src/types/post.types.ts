export interface Post {
  id: string;
  senderId: string;
  username: string;
  userImage?: string;
  postImage: string;
  caption: string;
  likedBy: string[];
  commentsCount: number;
}

export interface ApiPost {
  _id: string;
  content: string;
  photoUrl?: string;
  senderId: string;
  likes: string[];
}

export interface UpdatePostPayload {
  content?: string;
  photo?: File;
}
