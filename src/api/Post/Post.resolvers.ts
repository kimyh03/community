import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { CreatePostInput } from "./types/CreatePostInput";
import { DeletePostInput } from "./types/DeletePostInput";
import { EditPostInput } from "./types/EditPostInput";
import { SeePostDetailInput } from "./types/SeePostDetailInput";
import { ToggleBookmarkPostInput } from "./types/ToggleBookmarkPostInput";

@Resolver()
export class PostResolver {
  @Mutation(() => Post)
  async createPost(@Arg("args") args: CreatePostInput, @Ctx() ctxUser) {
    if (!ctxUser) throw Error("Log in please");
    const category = await Category.findOne({
      where: { title: args.category }
    });
    if (!category) throw Error("Category not found");
    try {
      const newPost = Post.create({
        title: args.title,
        text: args.text,
        user: ctxUser,
        category
      });
      await newPost.save();
      return {
        ok: true,
        error: null,
        post: newPost
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        post: null
      };
    }
  }

  @Query(() => Post)
  async seePostDetail(@Arg("args") args: SeePostDetailInput) {
    const post = await Post.findOne({
      relations: ["user", "likes", "comments"],
      where: { id: args.id }
    });
    if (!post) throw Error("Post not found");
    return {
      ok: true,
      error: null,
      post
    };
  }

  @Mutation(() => Post)
  async editPost(@Arg("args") args: EditPostInput, @Ctx() ctxUser) {
    if (!ctxUser) throw Error("Log in please");
    const post = await Post.findOne({
      where: { id: args.id },
      relations: [`user`]
    });
    if (!post) throw Error("Post not found");
    if (post.user.id !== ctxUser.id) throw Error("You don't have a permission");
    try {
      await Object.assign(post, args);
      post.save();
      return {
        ok: true,
        error: null,
        post
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        post: null
      };
    }
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("args") args: DeletePostInput, @Ctx() ctxUser) {
    if (!ctxUser) throw Error("Log in please");
    const post = await Post.findOne({
      where: { id: args.id },
      relations: ["user"]
    });
    if (!post) throw Error("Post not found");
    if (post.user.id !== ctxUser.id) throw Error("You don't have a permission");
    try {
      await post.remove();
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

  @Mutation(() => Post)
  async toggleBookmarkPost(
    @Arg("args") args: ToggleBookmarkPostInput,
    @Ctx() ctxUser
  ) {
    if (!ctxUser.id) throw Error("Log in please");
    const user = await User.findOne({
      where: { id: ctxUser.id },
      relations: ["bookmarkedPosts"]
    });
    if (!user) throw Error("User not found");
    const post = await Post.findOne({ where: { id: args.id } });
    if (!post) throw Error("Post not found");
    try {
      const isBookmarkedPost = user.bookmarkedPostsIds.includes(
        Number(args.id)
      );
      let cleanBookmarkedPosts: Post[];
      if (isBookmarkedPost) {
        cleanBookmarkedPosts = user.bookmarkedPosts.filter(
          (item) => item.id !== post.id
        );
      } else {
        cleanBookmarkedPosts = [...user.bookmarkedPosts, post];
      }
      user.bookmarkedPosts = cleanBookmarkedPosts;
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

  @Query(() => [Post])
  async posts() {
    const posts = await Post.find({
      relations: ["likes", "comments", "bookMakedUsers"]
    });
    return posts;
  }
}
