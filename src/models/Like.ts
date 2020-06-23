import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
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
  @Column({ nullable: true })
  userId: number;

  @Field(() => Post)
  @ManyToOne((type) => Post, (post) => post.likes, {
    onDelete: "CASCADE"
  })
  post: Post;

  @Field(() => Number)
  @RelationId((like: Like) => like.post)
  @Column({ nullable: true })
  postId: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
