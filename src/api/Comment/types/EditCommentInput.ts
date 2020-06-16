import { Field, InputType } from "type-graphql";

@InputType()
export class EditCommentInput {
  @Field()
  commentId: string;

  @Field()
  text: string;
}
