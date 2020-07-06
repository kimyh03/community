import jwt from "jsonwebtoken";

const createJWT = async (id: string) => {
  const token = await jwt.sign(
    {
      id
    },
    process.env.JWT_TOKEN || ""
  );
  return token;
};
export default createJWT;
