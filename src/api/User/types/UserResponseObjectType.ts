import { Field, ObjectType } from "type-graphql";
import { User } from "../../../models/User";

@ObjectType()
export class UserResponseObjectType {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  user?: User;
}
