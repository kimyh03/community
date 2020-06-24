import bcrypt from "bcrypt";

export const encryptToHash = async (unHashedText) => {
  const BCRYPT_ROUNDS = 10;
  const hashedText = await bcrypt.hash(unHashedText, BCRYPT_ROUNDS);
  return hashedText;
};

export const comparePassword = async (insertPassword, hasedPassword) => {
  return await bcrypt.compare(insertPassword, hasedPassword);
};
