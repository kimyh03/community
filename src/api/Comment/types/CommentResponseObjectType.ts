import { Field, ObjectType } from "type-graphql";
import { Comment } from "../../../models/Comment";

@ObjectType()
export class CommentResponseObjectType {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  comment: Comment;
}
