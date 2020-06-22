import { Field, InputType } from "type-graphql";

@InputType()
export class SeePostListInput {
  @Field()
  id: string;

  @Field()
  page: number;
}
