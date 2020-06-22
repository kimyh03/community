import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class ToggleFavCategoryResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;
}
