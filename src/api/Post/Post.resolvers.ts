import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { getRepository, Like } from "typeorm";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { PostResponseInterface } from "../ResponseInterface";
import { PostResponseObjectType } from "./types/PostResponeseObjectType";
import { SeePostListResponse } from "./types/SeePostListResponse";

@Resolver()
export class PostResolver {
  @Mutation(() => PostResponseObjectType)
  async createPost(
    @Arg("categoryTitle") categoryTitle: string,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const category = await Category.findOne({
      where: { title: categoryTitle }
    });
    if (!category) throw Error("Category not found");
    try {
      const newPost = Post.create({
        title,
        text,
        user: ctxUser,
        userName: ctxUser.nickname,
        category,
        categoryTitle
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
  async seePostDetail(@Arg("id") id: string, @Ctx() ctxUser) {
    const post = await Post.findOne({
      relations: ["user", "likes", "comments"],
      where: { id }
    });
    if (!post) throw Error("Post not found");
    let isLiked;
    let isBookmarked;
    if (ctxUser.id) {
      isBookmarked = await ctxUser.bookmarkedPostsIds.includes(post.id);
      const existLike = await post.likes.filter(
        (like) => like.userId === ctxUser.id
      );
      if (existLike.length === 1) {
        isLiked = true;
      } else isLiked = false;
    }

    post.viewCount += 1;
    post.save();
    return {
      ok: true,
      error: null,
      post,
      reqUser: ctxUser.nickname,
      isBookmarked,
      isLiked
    };
  }

  @Query(() => PostResponseObjectType)
  async getPostForEdit(@Arg("id") id: string) {
    const post = await Post.findOne({
      where: { id }
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
    @Arg("title") title: string,
    @Arg("text") text: string,
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
      post.title = title;
      post.text = text;
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
    @Arg("id") id: string,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const post = await Post.findOne({ where: { id } });
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

  @Query(() => PostResponseObjectType)
  async searchPost(@Arg("term") term: string, @Arg("time") time: number) {
    const TAKE = 10;
    try {
      const postRepository = await getRepository(Post);
      const posts = await postRepository.find({
        where: [{ title: Like(`%${term}%`) }, { text: Like(`%${term}%`) }],
        order: {
          id: "DESC"
        },
        take: TAKE,
        skip: (time - 1) * TAKE
      });
      return {
        ok: true,
        posts
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
    @Arg("page") page: number,
    @Ctx() ctxUser
  ) {
    const TAKE = 15;
    try {
      const postRepository = await getRepository(Post);
      const posts = await postRepository.find({
        where: { categoryTitle },
        order: {
          id: "DESC"
        },
        take: TAKE,
        skip: (page - 1) * TAKE
      });
      if (posts?.length === 0) throw Error("Post not found");
      const category = await Category.findOne({
        where: { title: categoryTitle }
      });
      if (!category) throw Error("Category not found");
      let isFav;
      if (ctxUser.id) {
        isFav = await ctxUser.favCategoriesIds.includes(category.id);
      }
      return {
        ok: true,
        error: null,
        posts,
        isFav,
        postCount: category.postCount
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
    @Arg("id") id: string,
    @Ctx() ctxUser
  ): Promise<PostResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const user = await User.findOne({
      where: { id: ctxUser.id },
      relations: ["bookmarkedPosts"]
    });
    if (!user) throw Error("User not found");
    const post = await Post.findOne({ where: { id } });
    if (!post) throw Error("Post not found");
    try {
      const isBookmarkedPost = user.bookmarkedPostsIds.includes(Number(id));
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
