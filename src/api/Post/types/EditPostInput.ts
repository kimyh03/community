import { Field, InputType } from "type-graphql";

@InputType()
export class EditPostInput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  text: string;
}
