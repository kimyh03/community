import { Field, InputType } from "type-graphql";

@InputType()
export class DeletePostInput {
  @Field()
  id: string;
}
