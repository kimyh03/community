import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../models/User";
import createJWT from "../../utils/createJWT";
import { comparePassword, encryptToHash } from "../../utils/hashAuthentication";
import { UserResponseInterface } from "../ResponseInterface";
import { ChangePasswordInput } from "./types/ChangePasswordInput";
import { DeleteAccountInput } from "./types/DeleteAccountInput";
import { TokenResponse } from "./types/TokenResponse";
import { UserResponseObjectType } from "./types/UserResponseObjectType";

@Resolver()
export class UserResolver {
  @Mutation(() => TokenResponse)
  async signUp(
    @Arg("nickname") nickname: string,
    @Arg("password") password: string,
    @Arg("email") email: string
  ) {
    const existUserWithEmail = await User.findOne({ where: { email } });
    const existUserWithNickname = await User.findOne({ where: { nickname } });
    if (existUserWithEmail?.id) {
      throw Error("이미 존재하는 이메일 입니다.");
    } else if (existUserWithNickname?.id) {
      throw Error("이미 존재하는 닉네임 입니다.");
    } else {
      const hashedPassword = await encryptToHash(password);
      const newUser = await User.create({
        email,
        password: hashedPassword,
        nickname
      });
      await newUser.save();
      return {
        ok: true,
        error: null
      };
    }
  }

  @Mutation(() => TokenResponse)
  async signIn(
    @Arg("nickname") nickname: string,
    @Arg("password") password: string
  ): Promise<UserResponseInterface> {
    try {
      const existUser = await User.findOne({
        where: { nickname }
      });
      if (!existUser) {
        return {
          ok: false,
          error: "User not found with that ID"
        };
      }
      const checkPassword = await comparePassword(password, existUser.password);
      if (checkPassword) {
        const token = await createJWT(existUser.id);
        return {
          ok: true,
          error: null,
          token
        };
      } else {
        return {
          ok: false,
          error: "Wrong password"
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Query(() => User)
  async getMe(@Ctx() ctxUser) {
    try {
      const user = await User.findOne({
        where: { id: ctxUser.id }
      });
      return user;
    } catch (error) {
      return error.message;
    }
  }

  @Query(() => UserResponseObjectType)
  async getUserProfile(@Arg("nickname") nickname: string, @Ctx() ctxUser) {
    if (nickname === String(ctxUser.nickname)) {
      try {
        const user = await User.findOne({
          where: { nickname: ctxUser.nickname },
          relations: ["posts", "bookmarkedPosts", "favCategories"]
        });
        return {
          ok: true,
          error: null,
          user,
          reqUser: ctxUser.nickname
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          user: null
        };
      }
    } else {
      try {
        const user = await User.findOne({
          where: { nickname },
          relations: ["posts"]
        });
        return {
          ok: true,
          error: null,
          user
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          user: null
        };
      }
    }
  }

  @Mutation(() => UserResponseObjectType)
  async editBio(@Arg("bio") bio: string, @Ctx() ctxUser: User) {
    if (!ctxUser) throw Error("Log in please");
    try {
      ctxUser.bio = bio;
      await ctxUser.save();
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

  @Mutation(() => UserResponseObjectType)
  async changePassword(
    @Arg("args") args: ChangePasswordInput,
    @Ctx() ctxUser: User
  ): Promise<UserResponseInterface> {
    if (!ctxUser) throw Error("Log in please");
    if (args.id !== String(ctxUser.id))
      throw Error("You don't have permission!");
    try {
      const checkPassword = await comparePassword(
        args.currntPassword,
        ctxUser.password
      );
      if (checkPassword) {
        const hashedPassword = await encryptToHash(args.newPassword);
        ctxUser.password = hashedPassword;
        await ctxUser.save();
        return {
          ok: true,
          error: null
        };
      } else {
        return {
          ok: false,
          error: "Wrong password!"
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Mutation(() => UserResponseObjectType)
  async deleteAccount(
    @Arg("args") args: DeleteAccountInput,
    @Ctx() ctxUser: User
  ): Promise<UserResponseInterface> {
    if (!ctxUser?.id) throw Error("Log in please");
    if (args.id !== String(ctxUser.id))
      throw Error("You don't have permission!");
    try {
      const checkPassword = comparePassword(args.password, ctxUser.password);
      if (checkPassword) {
        await ctxUser.remove();
        return {
          ok: true,
          error: null
        };
      } else {
        return {
          ok: false,
          error: "Wrong password!"
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Mutation(() => UserResponseObjectType)
  async superDeleteUser(@Arg("args") args: string) {
    const user = await User.findOne({ where: { id: args } });
    if (!user) throw Error("a");
    await user.remove();
    return {
      ok: true,
      error: null,
      user
    };
  }

  @Query(() => [User])
  async users() {
    return await User.find();
  }
}
