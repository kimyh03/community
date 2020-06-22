import { Field, ObjectType } from "type-graphql";
import { Category } from "../../../models/Category";

@ObjectType()
export class CreateCategoryResponse {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error: string;

  @Field({ nullable: true })
  category: Category;
}
