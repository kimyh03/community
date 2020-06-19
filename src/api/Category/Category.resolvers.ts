import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { CreateCategoryInput } from "./types/CreateCategoryInput";

@Resolver()
export class CategoryResolver {
  @Mutation(() => Category)
  async createCategory(@Arg("data") args: CreateCategoryInput, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony") throw Error("You don't have a permission");
    const newCategory = await Category.create({
      title: args.title
    });
    await newCategory.save();
    return newCategory;
  }

  @Query(() => [Post])
  async seePostList(@Arg("title") title: string) {
    const category = await Category.findOne({
      where: { title },
      relations: ["posts"]
    });
    if (!category) throw Error("Category not found");
    const posts = category.posts;
    return posts;
  }

  @Query(() => [Category])
  async categories() {
    const categories = await Category.find({
      relations: ["posts", "haveFavUsers"]
    });
    return categories;
  }

  @Mutation(() => Category)
  async editCategory(
    @Arg("id") id: string,
    @Arg("title") title: string,
    @Ctx() ctxUser
  ) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony") throw Error("You don't have a permission");
    const category = await Category.findOne({ where: { id } });
    if (!category) throw Error("Category not found");
    category.title = title;
    category.save();
    return category;
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Arg("title") title: string, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony") throw Error("You don't have a permission");
    const category = await Category.findOne({ where: { title } });
    if (!category) throw Error("Category not found");
    await category.remove();
    return true;
  }

  @Mutation(() => User)
  async toggleFavCategory(@Arg("id") id: string, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");

    const user = await User.findOne({
      where: { id: ctxUser.id },
      relations: ["favCategories"]
    });
    if (!user) throw Error("User not found");

    const category = await Category.findOne({ where: { id } });
    if (!category) throw Error("Category not found");

    let cleanFavList = user.favCategories;
    const isFavCategory = user.favCategoriesIds.includes(Number(id));

    if (isFavCategory) {
      cleanFavList = cleanFavList.filter((item) => item.id !== category.id);
    } else {
      cleanFavList = [...cleanFavList, category];
    }
    user.favCategories = cleanFavList;
    await user.save();
    return user;
  }
}
