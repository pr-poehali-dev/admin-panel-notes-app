export const API = {
  auth: "https://functions.poehali.dev/5f0feb0c-523e-4209-8db3-345b56a54bd7",
  posts: "https://functions.poehali.dev/6a501794-2356-4902-94eb-358f13838c29",
  clans: "https://functions.poehali.dev/13510516-f861-456c-85ab-ca66e3040ad5",
  community: "https://functions.poehali.dev/0a68ceb0-57ab-47b6-aafc-22c878580c2a",
  youtube: "https://functions.poehali.dev/590cfc0d-3ea2-497c-96a6-ad22e4d253fc",
};

export function authHeaders(): Record<string, string> {
  const session = localStorage.getItem("session");
  return session
    ? { "Content-Type": "application/json", "X-Session-Id": session }
    : { "Content-Type": "application/json" };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_emoji: string;
  level: number;
  xp: number;
  bio?: string;
}

export function getSession(): string | null {
  return localStorage.getItem("session");
}
export function getUser(): User | null {
  const s = localStorage.getItem("user");
  return s ? JSON.parse(s) : null;
}
export function saveAuth(session: string, user: User) {
  localStorage.setItem("session", session);
  localStorage.setItem("user", JSON.stringify(user));
}
export function logout() {
  localStorage.removeItem("session");
  localStorage.removeItem("user");
}
