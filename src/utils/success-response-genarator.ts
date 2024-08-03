export function sendSuccessResponse(data) {
  return {
    data,
  };
}

export function sendRefreshToken(res, token: string, tokenName: string) {
  res.cookie(tokenName, token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}
