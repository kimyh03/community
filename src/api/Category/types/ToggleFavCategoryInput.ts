import { Field, InputType } from "type-graphql";

@InputType()
export class ToggleFavCategoryInput {
  @Field()
  id: string;
}
