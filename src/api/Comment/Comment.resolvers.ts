import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Comment } from "../../models/Comment";
import { Post } from "../../models/Post";
import { CommentResponseInterface } from "../ResponseInterface";
import { CommentResponseObjectType } from "./types/CommentResponseObjectType";
import { DeleteCommentInput } from "./types/DeleteCommentInput";
import { EditCommentInput } from "./types/EditCommentInput";

@Resolver()
export class CommentResolver {
  @Mutation(() => CommentResponseObjectType)
  async createComment(
    @Arg("postId") postId: string,
    @Arg("text") text: string,
    @Ctx() ctxUser
  ): Promise<CommentResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) throw Error("Post not found");
    try {
      const newComment = await Comment.create({
        user: ctxUser,
        userName: ctxUser.nickname,
        post,
        text
      });
      post.commentCount = post.commentCount + 1;
      await post.save();
      await newComment.save();
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

  @Mutation(() => CommentResponseObjectType)
  async editComment(
    @Arg("args") args: EditCommentInput,
    @Ctx() ctxUser
  ): Promise<CommentResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const comment = await Comment.findOne({
      where: { id: args.commentId },
      relations: ["user"]
    });
    if (!comment) throw Error("Comment not found");
    if (comment.user.id !== ctxUser.id)
      throw Error("You don't have a permission");
    try {
      comment.text = args.text;
      await comment.save();
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

  @Mutation(() => CommentResponseObjectType)
  async deleteComment(
    @Arg("args") args: DeleteCommentInput,
    @Ctx() ctxUser
  ): Promise<CommentResponseInterface> {
    if (!ctxUser.id) throw Error("Log in please");
    const comment = await Comment.findOne({
      where: { id: args.commentId },
      relations: ["user"]
    });
    if (!comment) throw Error("Comment not found");
    const post = await Post.findOne({
      where: { id: args.postId }
    });
    if (!post) throw Error("Post not found");
    if (comment.user.id !== ctxUser.id)
      throw Error("You don't have a permission");
    try {
      await comment.remove();
      post.commentCount = post.commentCount - 1;
      await post.save();
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

  @Query(() => [Comment])
  async comments() {
    const comments = await Comment.find();
    return comments;
  }
}
