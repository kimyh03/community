import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { PostResponseInterface } from "../ResponseInterface";
import { CreatePostInput } from "./types/CreatePostInput";
import { DeletePostInput } from "./types/DeletePostInput";
import { EditPostInput } from "./types/EditPostInput";
import { PostResponseObjectType } from "./types/PostResponeseObjectType";
import { SeePostListResponse } from "./types/SeePostListResponse";
import { ToggleBookmarkPostInput } from "./types/ToggleBookmarkPostInput";

@Resolver()
export class PostResolver {
  @Mutation(() => PostResponseObjectType)
  async createPost(
    @Arg("args") args: CreatePostInput,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const category = await Category.findOne({
      where: { title: args.categoryTitle }
    });
    if (!category) throw Error("Category not found");
    try {
      const newPost = Post.create({
        title: args.title,
        text: args.text,
        user: ctxUser,
        userName: ctxUser.nickname,
        category,
        categoryTitle: category.title
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
  async seePostDetail(@Arg("id") id: string): Promise<PostResponseInterface> {
    const post = await Post.findOne({
      relations: ["user", "likes", "comments"],
      where: { id }
    });
    if (!post) throw Error("Post not found");
    post.viewCount += 1;
    post.save();
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
    if (!ctxUser.id) throw Error("Log in please");
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
    if (!ctxUser.id) throw Error("Log in please");
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
  async seePostList(
    @Arg("categoryTitle") categoryTitle: string,
    @Arg("page") page: number
  ): Promise<PostResponseInterface> {
    const TAKE = 10;
    try {
      const postRepository = await getRepository(Post);
      const posts = await postRepository.find({
        where: { categoryTitle },
        take: TAKE,
        skip: (page - 1) * TAKE
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
