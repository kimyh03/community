import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DeletePostResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;
}
