import { Field, InputType } from "type-graphql";

@InputType()
export class ToggleBookmarkPostInput {
  @Field()
  id: string;
}
