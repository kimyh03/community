import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class SignUpInput {
  @Field()
  nickname: string;

  @Field()
  userId: string;

  @Field()
  password: string;

  @Field()
  @IsEmail()
  email: string;
}
