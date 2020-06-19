import { Field, InputType } from "type-graphql";

@InputType()
export class EditCategoryInput {
  @Field()
  group: string;

  @Field()
  title: string;
}
