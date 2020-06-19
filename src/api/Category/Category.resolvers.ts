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
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const newCategory = await Category.create({
        title: args.title
      });
      await newCategory.save();
      return {
        ok: true,
        error: null,
        category: newCategory
      };
    } catch (error) {
      return {
        ok: true,
        error: error.message,
        category: null
      };
    }
  }

  @Query(() => [Post])
  async seePostList(@Arg("title") title: string) {
    try {
      const category = await Category.findOne({
        where: { title },
        relations: ["posts"]
      });
      if (!category) throw Error("Category not found");
      const posts = category.posts;
      return {
        ok: true,
        error: null,
        posts
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        posts: null
      };
    }
  }

  @Mutation(() => Category)
  async editCategory(
    @Arg("id") id: string,
    @Arg("title") title: string,
    @Ctx() ctxUser
  ) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const category = await Category.findOne({ where: { id } });
      if (!category) throw Error("Category not found");
      category.title = title;
      category.save();
      return {
        ok: true,
        error: null,
        category
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        category: null
      };
    }
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Arg("title") title: string, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const category = await Category.findOne({ where: { title } });
      if (!category) throw Error("Category not found");
      await category.remove();
      return {
        ok: true,
        error: null
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
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
    try {
      let cleanFavList = user.favCategories;
      const isFavCategory = user.favCategoriesIds.includes(Number(id));
      if (isFavCategory) {
        cleanFavList = cleanFavList.filter((item) => item.id !== category.id);
      } else {
        cleanFavList = [...cleanFavList, category];
      }
      user.favCategories = cleanFavList;
      await user.save();
      return {
        ok: true,
        error: null
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Query(() => [Category])
  async categories() {
    const categories = await Category.find({
      relations: ["posts"]
    });
    return categories;
  }
}
