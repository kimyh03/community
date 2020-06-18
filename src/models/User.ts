import { IsEmail } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn
} from "typeorm";
import { Category } from "./Category";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { Post } from "./Post";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column({ type: "text" })
  nickname: string;

  @Field(() => String)
  @Column({ type: "text" })
  userId: string;

  @Field(() => String)
  @Column({ type: "text" })
  password: string;

  @Field(() => String)
  @Column({ type: "text" })
  @IsEmail()
  email: string;

  @Field(() => [Category])
  @ManyToMany((type) => Category)
  @JoinTable()
  favCategories: Category[];

  @Field(() => [Number])
  @RelationId((user: User) => user.favCategories)
  favCategoriesIds: number[];

  @Field(() => [Post])
  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  postCount: number;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isPrivateMyPosts: boolean;

  @Field(() => [Comment])
  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @Field(() => [Like])
  @OneToMany((type) => Like, (like) => like.user)
  likes: Like[];

  @Field(() => [Post])
  @ManyToMany((type) => Post)
  @JoinTable()
  bookmarkedPosts: Post[];

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isbanned: boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
