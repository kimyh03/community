import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Category } from "./Category";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { User } from "./User";

@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => Category)
  @ManyToOne((type) => Category, (category) => category.posts)
  category: Category;

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.posts)
  user: User;

  @Field(() => String)
  @Column({ type: "text" })
  title: string;

  @Field(() => String)
  @Column({ type: "text" })
  text: string;

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  viewCount: number;

  @Field(() => [Like])
  @OneToMany((type) => Like, (like) => like.post, {
    eager: true,
    cascade: true
  })
  likes: Like[];

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  likeCount: number;

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isLiked: boolean;

  @Field(() => [Comment])
  @OneToMany((type) => Comment, (comment) => comment.post, {
    eager: true,
    cascade: true
  })
  comments: Comment[];

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  commentCount: number;

  @Field(() => [User])
  @OneToMany((type) => User, (user) => user.bookmarkedPosts)
  bookMakedUsers: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
