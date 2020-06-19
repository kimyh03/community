import { Field, InputType } from "type-graphql";

@InputType()
export class ToggleLikePostInput {
  @Field()
  id: string;
}
