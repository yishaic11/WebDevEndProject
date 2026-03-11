export interface Comment {
  id: string;
  senderId: string;
  username: string;
  photoUrl: string;
  text: string;
}

export interface ApiComment {
  _id: string;
  content: string;
  postId: string;
  senderId: string;
  username: string;
  photoUrl?: string;
}
