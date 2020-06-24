import { Category } from "../models/Category";
import { Comment } from "../models/Comment";
import { Like } from "../models/Like";
import { Post } from "../models/Post";
import { User } from "../models/User";

export interface CategoryResponseInterface {
  ok: boolean;
  error: string | null;
  category?: Category | null;
}

export interface PostResponseInterface {
  ok: boolean;
  error: string | null;
  post?: Post | null;
  posts?: Post[] | null;
}
export interface CommentResponseInterface {
  ok: boolean;
  error: string | null;
  comment?: Comment | null;
}
export interface LikeResponseInterface {
  ok: boolean;
  error: string | null;
  like?: Like | null;
}
export interface UserResponseInterface {
  ok: boolean;
  error: string | null;
  user?: User | null;
  token?: string | null;
}
