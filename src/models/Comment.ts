import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.comments, {
    onDelete: "CASCADE"
  })
  user: User;

  @Field(() => Post)
  @ManyToOne((type) => Post, (post) => post.comments, {
    onDelete: "CASCADE"
  })
  post: Post;

  @Field(() => String)
  @Column({ type: "text" })
  text: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
