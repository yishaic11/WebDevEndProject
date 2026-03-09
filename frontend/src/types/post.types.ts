export interface ApiPost {
  _id: string;
  content: string;
  photoUrl?: string;
  senderId: string;
  likes: string[];
}

export interface CreatePostPayload {
  content: string;
  photo?: File;
}
