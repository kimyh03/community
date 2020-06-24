import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../models/User";
import createJWT from "../../utils/createJWT";
import { comparePassword, encryptToHash } from "../../utils/hashAuthentication";
import { UserResponseInterface } from "../ResponseInterface";
import { ChangePasswordInput } from "./types/ChangePasswordInput";
import { DeleteAccountInput } from "./types/DeleteAccountInput";
import { EditProfileInput } from "./types/EditProfileInput";
import { GerUserProfileInput } from "./types/GetUserProfileInput";
import { SignInInput } from "./types/SignInInput";
import { SignUpInput } from "./types/SignUpInput";
import { TokenResponse } from "./types/TokenResponse";
import { UserResponseObjectType } from "./types/UserResponseObjectType";

@Resolver()
export class UserResolver {
  @Mutation(() => TokenResponse)
  async signUp(@Arg("data") args: SignUpInput): Promise<UserResponseInterface> {
    try {
      const existUser = await User.findOne({ where: { email: args.email } });
      if (existUser?.id) {
        return {
          ok: false,
          error: "You have a account, Log in Please"
        };
      } else {
        const hashedPassword = await encryptToHash(args.password);
        const newUser = await User.create({
          email: args.email,
          accountId: args.accountId,
          password: hashedPassword,
          nickname: args.nickname
        });
        await newUser.save();
        const token = await createJWT(newUser.id);
        return {
          ok: true,
          error: null,
          token
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  @Query(() => TokenResponse)
  async signIn(@Arg("args") args: SignInInput): Promise<UserResponseInterface> {
    try {
      const existUser = await User.findOne({
        where: { accountId: args.accountId }
      });
      if (!existUser) {
        return {
          ok: false,
          error: "User not found with that ID"
        };
      }
      const checkPassword = await comparePassword(
        args.password,
        existUser.password
      );
      if (checkPassword) {
        const token = createJWT(existUser.id);
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

  @Query(() => UserResponseObjectType)
  async getUserProfile(
    @Arg("args") args: GerUserProfileInput,
    @Ctx() ctxUser
  ): Promise<UserResponseInterface> {
    if (args.id === String(ctxUser.id)) {
      try {
        const user = await User.findOne({
          where: { id: ctxUser.id },
          relations: ["posts", "bookmarkedPosts"]
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
    } else {
      try {
        const user = await User.findOne({
          where: { id: args.id },
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
  async editProfile(
    @Arg("id") id: string,
    @Arg("args") args: EditProfileInput,
    @Ctx() ctxUser: User
  ): Promise<UserResponseInterface> {
    if (!ctxUser) throw Error("Log in please");
    if (id === String(ctxUser.id)) {
      try {
        await Object.assign(ctxUser, args);
        await ctxUser.save();
        return {
          ok: true,
          error: null,
          user: ctxUser
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          user: null
        };
      }
    } else {
      return {
        ok: false,
        error: "You don't have permission!",
        user: null
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
    console.log(args.id, ctxUser.id);
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
