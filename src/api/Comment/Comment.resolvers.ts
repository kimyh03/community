import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Comment } from "../../models/Comment";
import { Post } from "../../models/Post";
import { CreateCommentInput } from "./types/CreateCommnetInput";
import { DeleteCommentInput } from "./types/DeleteCommentInput";
import { EditCommentInput } from "./types/EditCommentInput";

@Resolver()
export class CommentResolver {
  @Mutation(() => Comment)
  async createComment(@Arg("args") args: CreateCommentInput, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    const post = await Post.findOne({ where: { id: args.postId } });
    if (!post) throw Error("Post not found");
    const newComment = await Comment.create({
      user: ctxUser,
      post,
      text: args.text
    });
    post.commentCount = post.commentCount + 1;
    await post.save();
    await newComment.save();
    return newComment;
  }

  @Mutation(() => Comment)
  async editComment(@Arg("args") args: EditCommentInput, @Ctx() ctxUser) {
    if (!ctxUser.id) throw Error("Log in please");
    const comment = await Comment.findOne({
      where: { id: args.commentId },
      relations: ["user"]
    });
    if (!comment) throw Error("Comment not found");
    if (comment.user.id !== ctxUser.id)
      throw Error("You don't have a permission");
    comment.text = args.text;
    await comment.save();
    return comment;
  }

  @Mutation(() => Boolean)
  async deleteComment(@Arg("args") args: DeleteCommentInput, @Ctx() ctxUser) {
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
      return true;
    } catch {
      return false;
    }
  }

  @Query(() => [Comment])
  async comments() {
    const comments = await Comment.find();
    return comments;
  }
}
