import { Field, InputType } from "type-graphql";

@InputType()
export class ChangePasswordInput {
  @Field()
  id: string;

  @Field()
  currntPassword: string;

  @Field()
  newPassword: string;
}
