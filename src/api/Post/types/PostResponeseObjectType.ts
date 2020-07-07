import { Field, ObjectType } from "type-graphql";
import { Post } from "../../../models/Post";

@ObjectType()
export class PostResponseObjectType {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  post: Post;

  @Field({ nullable: true })
  reqUser: string;
}
