import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  categoryTitle: string;

  @Field()
  title: string;

  @Field()
  text: string;
}
