import { Field, InputType } from "type-graphql";

@InputType()
export class GerUserProfileInput {
  @Field()
  id: string;
}
