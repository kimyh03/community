import { Field, ObjectType } from "type-graphql";
import { Post } from "../../../models/Post";

@ObjectType()
export class CreatePostResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  post: Post;
}
