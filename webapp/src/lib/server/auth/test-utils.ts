export function createFormdata(username: string | null, password: string | null): FormData {
  const fd = new FormData();
  if (username !== null) {
    fd.append("username", username);
  }
  if (password !== null) {
    fd.append("password", password);
  }
  return fd;
}
