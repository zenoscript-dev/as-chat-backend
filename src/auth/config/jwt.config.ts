import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    signOptions: {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  };
});
