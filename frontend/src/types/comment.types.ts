export interface Comment {
  id: string;
  senderId: string;
  username: string;
  text: string;
}

export interface ApiComment {
  _id: string;
  content: string;
  postId: string;
  senderId: string;
}
