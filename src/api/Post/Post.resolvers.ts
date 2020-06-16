import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Category } from "../../models/Category";
import { Post } from "../../models/Post";
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
      relations: ["user", "category"],
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
      Object.assign(post, args);
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

  @Query(() => [Post])
  async posts() {
    const posts = await Post.find();
    return posts;
  }
}
