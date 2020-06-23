import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { PostResponseInterface } from "../../utils/ResponseInterface";
import { CreatePostInput } from "./types/CreatePostInput";
import { DeletePostInput } from "./types/DeletePostInput";
import { EditPostInput } from "./types/EditPostInput";
import { PostResponseObjectType } from "./types/PostResponeseObjectType";
import { SeePostDetailInput } from "./types/SeePostDetailInput";
import { SeePostListInput } from "./types/SeePostListInput";
import { SeePostListResponse } from "./types/SeePostListResponse";
import { ToggleBookmarkPostInput } from "./types/ToggleBookmarkPostInput";

@Resolver()
export class PostResolver {
  @Mutation(() => PostResponseObjectType)
  async createPost(
    @Arg("args") args: CreatePostInput,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser) throw Error("Log in please");
    const category = await Category.findOne({
      where: { id: args.categoryId }
    });
    if (!category) throw Error("Category not found");
    try {
      const newPost = Post.create({
        title: args.title,
        text: args.text,
        user: ctxUser,
        userName: ctxUser.nickname,
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

  @Query(() => PostResponseObjectType)
  async seePostDetail(
    @Arg("args") args: SeePostDetailInput
  ): Promise<PostResponseInterface> {
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

  @Mutation(() => PostResponseObjectType)
  async editPost(
    @Arg("id") id: string,
    @Arg("args") args: EditPostInput,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser) throw Error("Log in please");
    const post = await Post.findOne({
      where: { id },
      relations: [`user`]
    });
    if (!post) throw Error("Post not found");
    if (post.user.id !== ctxUser.id) throw Error("You don't have a permission");
    try {
      await Object.assign(post, args);
      await post.save();
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

  @Mutation(() => PostResponseObjectType)
  async deletePost(
    @Arg("args") args: DeletePostInput,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser) throw Error("Log in please");
    const post = await Post.findOne({ where: { id: args.id } });
    if (!post) throw Error("Post not found");
    if (post.userId !== ctxUser.id) throw Error("You don't have a permission");
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

  @Query(() => SeePostListResponse)
  async seePostList(@Arg("args") args: SeePostListInput) {
    const TAKE = 20;
    try {
      const postRepository = await getRepository(Post);
      const posts = await postRepository.find({
        where: { categoryId: args.categoryId },
        take: TAKE,
        skip: args.page * TAKE
      });
      if (posts?.length === 0) throw Error("Post not found");
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

  @Mutation(() => PostResponseObjectType)
  async toggleBookmarkPost(
    @Arg("args") args: ToggleBookmarkPostInput,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
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
      relations: ["category", "likes", "comments", "bookMakedUsers"]
    });
    return posts;
  }
}
