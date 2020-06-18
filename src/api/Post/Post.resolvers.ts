import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { CreatePostInput } from "./types/CreatePostInput";
import { EditPostInput } from "./types/EditPostInput";

@Resolver()
export class PostResolver {
  @Mutation(() => Post)
  async createPost(@Arg("data") args: CreatePostInput, @Ctx() user) {
    if (!user) throw Error("Log in please");
    const category = await Category.findOne({
      where: { title: args.category }
    });
    const newPost = Post.create({
      title: args.title,
      text: args.text,
      user,
      category
    });
    await newPost.save();
    return newPost;
  }

  @Query(() => Post)
  async seePostDetail(@Arg("id") id: string) {
    const post = await Post.findOne({
      relations: ["user", "category", "comments"],
      where: { id }
    });
    if (!post) throw Error("Post not found");
    return post;
  }

  @Mutation(() => Post)
  async editPost(
    @Arg("id") id: string,
    @Arg("data") args: EditPostInput,
    @Ctx() user
  ) {
    if (!user) throw Error("Log in please");
    const post = await Post.findOne({ relations: [`user`], where: { id } });
    if (!post) throw Error("Post not found");
    if (post.user.id === user.id) {
      await Object.assign(post, args);
      post.save();
      return post;
    } else throw Error("You don't have a permission");
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: string, @Ctx() user) {
    if (!user) throw Error("Log in please");
    const post = await Post.findOne({ relations: ["user"], where: { id } });
    if (!post) throw Error("Post not found");
    if (post.user.id === user.id) {
      try {
        await post.remove();
        return true;
      } catch {
        return false;
      }
    } else throw Error("You don't have a permission");
  }

  @Mutation(() => Post)
  async toggleBookmarkPost(@Arg("id") id: string, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");

    const user = await User.findOne({
      where: { id: ctxUser.id },
      relations: ["bookmarkedPosts"]
    });
    if (!user) throw Error("User not found");

    const post = await Post.findOne({ where: { id } });
    if (!post) throw Error("Post not found");

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
    return user;
  }

  @Query(() => [Post])
  async posts() {
    const posts = await Post.find({
      relations: ["likes", "comments", "bookMakedUsers"]
    });
    return posts;
  }
}
