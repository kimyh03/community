import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../models/User";
import createJWT from "../../utils/createJWT";
import { SignUpInput } from "./types/SignUpInput";
import { SignUpResponse } from "./types/SignUpResponse";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users() {
    return await User.find();
  }

  @Mutation(() => SignUpResponse)
  async signUp(
    @Arg("data") args: SignUpInput,
    @Ctx() ctx
  ): Promise<SignUpResponse> {
    try {
      const { email } = args;
      const existUser = await User.findOne({ where: { email } });
      if (existUser) {
        const token = createJWT(existUser.id);
        return {
          ok: true,
          token
        };
      } else {
        const newUser = User.create(args);
        await newUser.save();
        const token = createJWT(newUser.id);
        return {
          ok: true,
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

  @Query(() => User)
  getMyProfile(@Ctx() user) {
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  @Query(() => User)
  async getUserProfile(@Arg("nickName") nickName: number) {
    const user = await User.findOne({ where: { nickName } });
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}
