import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInput {
  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  text: string;
}
