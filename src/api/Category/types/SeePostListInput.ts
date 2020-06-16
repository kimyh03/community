import { Field, InputType } from "type-graphql";

@InputType()
export class SeePostListInput {
  @Field()
  category: string;
}
