import { Field, InputType } from "type-graphql";

@InputType()
export class DeleteAccountInput {
  @Field()
  id: string;

  @Field()
  password: string;
}
