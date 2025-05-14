export type User = {
  user_id: number;
  username: string;
}

export type Location = {
  location_id: number;
  geom: {
    type: string;
    coordinates: [number, number];
  };
  checkin_count: number;
}