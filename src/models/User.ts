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
  RelationCount,
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
  @Column({ type: "text", nullable: true })
  accountId: string;

  @Field(() => String)
  @Column({ type: "text" })
  password: string;

  @Field(() => String)
  @Column({ type: "text" })
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  bio: string;

  @Field(() => [Category], { nullable: true })
  @ManyToMany((type) => Category, (category) => category.haveFavUsers, {
    nullable: true
  })
  @JoinTable()
  favCategories: Category[];

  @Field(() => [Number])
  @RelationId((user: User) => user.favCategories)
  favCategoriesIds: number[];

  @Field(() => [Post])
  @OneToMany((type) => Post, (post) => post.user)
  posts: Post[];

  @Field(() => Number)
  @RelationCount((user: User) => user.posts)
  postCount: number;

  @Field(() => [Comment])
  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @Field(() => [Like])
  @OneToMany((type) => Like, (like) => like.user)
  likes: Like[];

  @Field(() => [Like])
  @OneToMany((type) => Like, (like) => like.postUser)
  likesReceived: Like[];

  @Field(() => Number)
  @RelationCount((user: User) => user.likesReceived)
  likesReceivedCount: number;

  @Field(() => [Post], { nullable: true })
  @ManyToMany((type) => Post, (post) => post.bookMakedUsers, { nullable: true })
  @JoinTable()
  bookmarkedPosts: Post[];

  @Field(() => [Number])
  @RelationId((user: User) => user.bookmarkedPosts)
  bookmarkedPostsIds: number[];

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isMaster: boolean;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isPartner: boolean;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isBanned: boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
