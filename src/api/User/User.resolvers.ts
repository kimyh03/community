import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../models/User";
import createJWT from "../../utils/createJWT";
import { SignUpInput } from "./types/SignUpInput";
import { SignUpResponse } from "./types/SignUpResponse";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => SignUpResponse)
  async signUp(@Arg("data") data: SignUpInput): Promise<SignUpResponse> {
    try {
      const { email } = data;
      const existUser = await User.findOne({ where: { email } });
      if (existUser) {
        const token = createJWT(existUser.id);
        return {
          ok: true,
          token
        };
      } else {
        const newUser = User.create(data);
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
}
