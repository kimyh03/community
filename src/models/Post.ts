import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
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
  @ManyToOne((type) => Category, (category) => category.posts, {
    onDelete: "CASCADE"
  })
  category: Category;

  @Field(() => Number)
  @RelationId((post: Post) => post.category)
  @Column()
  categoryId: number;

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.posts, {
    onDelete: "CASCADE"
  })
  user: User;

  @Field(() => Number)
  @RelationId((post: Post) => post.user)
  userId: number;

  @Field(() => String)
  @Column({ type: "text" })
  userName: string;

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
  @OneToMany((type) => Like, (like) => like.post)
  likes: Like[];

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  likeCount: number;

  @Field(() => [Comment])
  @OneToMany((type) => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field(() => Number)
  @Column({ type: "integer", default: 0 })
  commentCount: number;

  @Field(() => [User])
  @ManyToMany((type) => User, (user) => user.bookmarkedPosts)
  @JoinTable()
  bookMakedUsers: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
