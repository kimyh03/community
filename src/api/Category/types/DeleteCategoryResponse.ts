import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DeleteCategoryResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;
}
