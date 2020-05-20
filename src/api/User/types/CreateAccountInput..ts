import { Field, InputType } from "type-graphql";

@InputType()
export class CreateAccountInput {
  @Field()
  nickname: string;

  @Field()
  username: string;

  @Field()
  email: string;
}
