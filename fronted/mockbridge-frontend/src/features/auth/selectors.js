export function selectAuthSnapshot(state) {
  return {
    accessToken: state.auth.accessToken,
    refreshToken: state.auth.refreshToken,
    user: state.auth.user,
  };
}
