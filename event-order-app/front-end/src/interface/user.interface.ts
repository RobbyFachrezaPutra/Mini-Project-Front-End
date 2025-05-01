export interface IUserParam {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "customer" | "event_organizer";
  referral_code?: string;
}
