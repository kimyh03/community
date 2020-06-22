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
import { Post } from "./Post";
import { User } from "./User";

@Entity()
@ObjectType()
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column({ type: "text", nullable: true })
  group: string;

  @Field(() => String)
  @Column({ type: "text" })
  title: string;

  @Field(() => [Post])
  @OneToMany((type) => Post, (post) => post.category)
  posts: Post[];

  @Field(() => [Number])
  @RelationId((category: Category) => category.posts)
  postsIds: number[];

  @Field(() => [User])
  @ManyToMany((type) => User, (user) => user.favCategories)
  @JoinTable()
  haveFavUsers: User[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: string;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: string;
}
