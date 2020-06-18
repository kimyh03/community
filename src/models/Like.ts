import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
@ObjectType()
export class Like extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.likes, {
    onDelete: "CASCADE"
  })
  user: User;

  @Field(() => Number)
  @RelationId((like: Like) => like.user)
  userId: number;

  @Field(() => Post)
  @ManyToOne((type) => Post, (post) => post.likes, {
    onDelete: "CASCADE"
  })
  post: Post;

  @Field(() => Number)
  @RelationId((like: Like) => like.post)
  postId: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
