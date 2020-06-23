import { Field, ObjectType } from "type-graphql";
import { Like } from "../../../models/Like";

@ObjectType()
export class ToggleLikePostResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  like: Like;
}
