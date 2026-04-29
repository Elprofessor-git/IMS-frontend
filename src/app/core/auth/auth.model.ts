export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  refreshToken?: string;
  user: IUser;
}

export interface IUser {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  roles: string[];
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

export interface IAuthResponse {
  token: string;
  refreshToken?: string;
}

// Aliases without I-prefix for backward compatibility
export type User = IUser;
export type UserProfile = IUser;
export type LoginRequest = ILoginRequest;
export type LoginResponse = ILoginResponse;


// Auto-generated aliases for backward compatibility
export type AuthResponse = IAuthResponse;
