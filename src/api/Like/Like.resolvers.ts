import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Like } from "../../models/Like";
import { Post } from "../../models/Post";
import { LikeResponseInterface } from "../ResponseInterface";
import { ToggleLikePostResponse } from "./types/ToggleLikePostResponse";

@Resolver()
export class LikeResolver {
  @Mutation(() => ToggleLikePostResponse)
  async toggleLikePost(
    @Arg("id") id: string,
    @Ctx() ctxUser
  ): Promise<LikeResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const post = await Post.findOne({
      where: { id },
      relations: ["user"]
    });
    if (!post) throw Error("Post not found");
    try {
      const existLike = await Like.findOne({
        where: { userId: ctxUser.id, postId: post.id }
      });
      if (existLike) {
        existLike.remove();
        return {
          ok: true,
          error: null
        };
      } else {
        const newLike = Like.create({
          user: ctxUser,
          postUser: post.user,
          post
        });
        await newLike.save();
        return {
          ok: true,
          error: null
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Query(() => [Like])
  async likes() {
    const likes = await Like.find({
      relations: ["post", "user"]
    });
    return likes;
  }
}
