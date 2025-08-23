export interface User {
  id: string;
  userName: string;
  email: string;
  nom: string;
  prenom: string;
  poste?: string;
  roleId?: number;
  role?: Role;
  estActif: boolean;
  dateCreation: Date;
  derniereConnexion?: Date;
}

export interface Role {
  id: number;
  nom: string;
  description?: string;
  permissions?: Permission[];
  utilisateurs?: User[];
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: Date;
}
