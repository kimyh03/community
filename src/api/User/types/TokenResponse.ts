import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class TokenResponse {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => Boolean, { nullable: true })
  existNickname?: boolean;

  @Field(() => Boolean, { nullable: true })
  existEmail?: boolean;
}
