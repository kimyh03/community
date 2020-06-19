import { Field, InputType } from "type-graphql";

@InputType()
export class EditCategoryInput {
  @Field()
  id: string;

  @Field()
  title: string;
}
