import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { CreateCategoryInput } from "./types/CreateCategoryInput";
import { CreateCategoryResponse } from "./types/CreateCategoryResponse";
import { DeleteCategoryInput } from "./types/DeleteCategoryInput";
import { DeleteCategoryResponse } from "./types/DeleteCategoryResponse";
import { EditCategoryInput } from "./types/EditCategoryInput";
import { EditCategoryResponse } from "./types/EditCategoryResponse";
import { SeePostListInput } from "./types/SeePostListInput";
import { SeePostListResponse } from "./types/SeePostListResponse";
import { ToggleFavCategoryInput } from "./types/ToggleFavCategoryInput";
import { ToggleFavCategoryResponse } from "./types/ToggleFavCategoryResponse";

@Resolver()
export class CategoryResolver {
  @Mutation(() => CreateCategoryResponse)
  async createCategory(@Arg("args") args: CreateCategoryInput, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const newCategory = await Category.create({
        title: args.title,
        group: args.group
      });
      await newCategory.save();
      return {
        ok: true,
        error: null,
        category: newCategory
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        category: null
      };
    }
  }

  @Query(() => SeePostListResponse)
  async seePostList(@Arg("args") args: SeePostListInput) {
    const TAKE = 3;
    try {
      const posts = await Post.find({
        where: { categoryId: args.id },
        relations: ["category", "user"],
        take: TAKE,
        skip: args.page * TAKE
      });
      if (!posts) throw Error("Post not found");
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

  @Mutation(() => EditCategoryResponse)
  async editCategory(
    @Arg("id") id: string,
    @Arg("args") args: EditCategoryInput,
    @Ctx() ctxUser
  ) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const category = await Category.findOne({ where: { id } });
      if (!category) throw Error("Category not found");
      await Object.assign(category, args);
      await category.save();
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

  @Mutation(() => DeleteCategoryResponse)
  async deleteCategory(@Arg("args") args: DeleteCategoryInput, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    if (ctxUser.nickname !== "Hoony")
      throw Error("You don't have a permission");
    try {
      const category = await Category.findOne({ where: { id: args.id } });
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

  @Mutation(() => ToggleFavCategoryResponse)
  async toggleFavCategory(
    @Arg("args") args: ToggleFavCategoryInput,
    @Ctx() ctxUser
  ) {
    if (!ctxUser.id) throw Error("Log in please");
    const user = await User.findOne({
      where: { id: ctxUser.id },
      relations: ["favCategories"]
    });
    if (!user) throw Error("User not found");
    const category = await Category.findOne({ where: { id: args.id } });
    if (!category) throw Error("Category not found");
    try {
      let cleanFavList = user.favCategories;
      const isFavCategory = user.favCategoriesIds.includes(Number(args.id));
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
