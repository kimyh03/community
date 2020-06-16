import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { CreateCategoryInput } from "./types/CreateCategoryInput";
import { SeePostListInput } from "./types/SeePostListInput";

@Resolver()
export class CategoryResolver {
  @Mutation(() => Category)
  async createCategory(@Arg("data") args: CreateCategoryInput, @Ctx() user) {
    if (!user) throw Error("Log in please");
    if (user.nickname !== "Hoony") throw Error("You don't have a permission");
    const newCategory = await Category.create({
      title: args.title
    });
    await newCategory.save();
    return newCategory;
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Arg("title") title: string, @Ctx() user) {
    if (!user) throw Error("Log in please");
    if (user.nickname !== "Hoony") throw Error("You don't have a permission");
    const category = await Category.findOne({ where: { title } });
    if (!category) throw Error("Category not found");
    await category.remove();
    return true;
  }

  @Query(() => [Post])
  async seePostList(@Arg("data") args: SeePostListInput) {
    const category = await Category.findOne({
      where: { title: args.category },
      relations: ["posts"]
    });
    if (!category) throw Error("Category not found");
    const posts = category.posts;
    return posts;
  }

  @Query(() => [Category])
  async categories() {
    const categories = await Category.find({ relations: ["posts"] });
    return categories;
  }
}
