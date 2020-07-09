import { Field, ObjectType } from "type-graphql";
import { Post } from "../../../models/Post";

@ObjectType()
export class SeePostListResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field({ nullable: true })
  isFav: boolean;
}
