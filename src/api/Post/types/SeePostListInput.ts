import { Field, InputType } from "type-graphql";

@InputType()
export class SeePostListInput {
  @Field()
  categoryId: number;

  @Field()
  page: number;
}
