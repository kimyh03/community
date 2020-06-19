import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Like } from "../../models/Like";
import { Post } from "../../models/Post";
import { User } from "../../models/User";

@Resolver()
export class LikeResolver {
  @Mutation(() => Boolean)
  async toggleLikePost(@Arg("id") id: string, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    const user = await User.findOne({ where: { id: ctxUser.id } });
    if (!user) throw Error("User not found");
    const post = await Post.findOne({ where: { id } });
    if (!post) throw Error("Post not found");
    try {
      const existLike = await Like.findOne({
        where: { userId: user.id, postId: post.id }
      });
      if (existLike) {
        existLike.remove();
        return {
          ok: true,
          error: null
        };
      } else {
        const newLike = Like.create({
          user,
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
