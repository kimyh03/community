import { Field, InputType } from "type-graphql";

@InputType()
export class SeePostDetailInput {
  @Field()
  id: string;
}
