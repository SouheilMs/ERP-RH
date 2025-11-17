export interface Employee {
  id?: string;       // optionnel si généré côté backend
  username: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
}

