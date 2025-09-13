/**
 * 公開ページのURLを格納する配列
 * これらのページについては認証不要でアクセス可能
 */
export const publicRoutes: string[] = ["/", "/auth/sort"];

/**
 * 認証用ページのURLを格納する配列
 * これらのページについてはログイン済みの場合、設定ページにリダイレクトさせる
 */
export const authRoutes: string[] = ["/auth/login", "/auth/register"];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/settings";