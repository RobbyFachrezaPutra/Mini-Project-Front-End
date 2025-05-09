export interface IEvent {
  id           : number;
  organizer_id : number;
  name         : string;
  description  : string;
  category_id  : number;
  location     : string;
  start_date   : Date;
  end_date     : Date;
  available_seats : number;
  banner_url   : string;
  status       : string;
  created_at   : Date;
  updated_at   : Date;
}