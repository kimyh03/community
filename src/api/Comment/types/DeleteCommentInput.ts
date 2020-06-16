import { Field, InputType } from "type-graphql";

@InputType()
export class DeleteCommentInput {
  @Field()
  postId: string;

  @Field()
  commentId: string;
}
