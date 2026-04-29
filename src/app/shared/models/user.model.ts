export interface IUser {
  id: string;
  userName: string;
  email: string;
  nom: string;
  prenom: string;
  poste?: string;
  roleId?: number;
  role?: IRole;
  estActif: boolean;
  dateCreation: Date;
  derniereConnexion?: Date;
}

export interface IRole {
  id: number;
  nom: string;
  description?: string;
  permissions?: IPermission[];
  utilisateurs?: IUser[];
}

export interface IPermission {
  id: number;
  module: string;
  action: string;
  description?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  refreshToken: string;
  user: IUser;
  expiresAt: Date;
}

// Aliases without I-prefix for backward compatibility
export type User = IUser;
export type Role = IRole;
export type Permission = IPermission;
export type LoginRequest = ILoginRequest;
export type LoginResponse = ILoginResponse;
