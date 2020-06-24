import { Field, InputType } from "type-graphql";

@InputType()
export class SignInInput {
  @Field()
  accountId: string;

  @Field()
  password: string;
}
