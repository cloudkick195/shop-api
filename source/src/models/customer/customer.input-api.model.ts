enum Gender { M, F, O }
enum Type { normal, vip }
export interface CustomerInterface {
  name: string;
  birth_day?: string;
  gender?: Gender;
  email: string;
  password: string;
  phone?: string;
  phone_temporary?: string;
  address: string;
  type: Type
}

export interface CustomerModel extends CustomerInterface {
  customer_id: number;
}