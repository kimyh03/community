import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  categoryId: string;

  @Field()
  title: string;

  @Field()
  text: string;
}
