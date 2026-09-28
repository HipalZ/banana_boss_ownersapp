export interface DuesUser {
  _id: string;
  name?: string;
  phone?: string;
  userName?: string;
  userPhone?: string;
  status: boolean;
  currentDuesAmount: number;
}
