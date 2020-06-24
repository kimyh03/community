import { Field, InputType } from "type-graphql";

@InputType()
export class EditProfileInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  bio?: string;
}
