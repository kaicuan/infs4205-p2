import { auth } from '@/auth';
import sql from '@/lib/db';
import { Location, User } from '@/lib/definitions';

export async function getAuthenticatedUser() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error('Unauthorized: No user session found.');
  }

  return user;
}

export async function getLastPosition() {
  const user = await getAuthenticatedUser();
  try {
    const data = await sql<Location[]>`
      SELECT
        l.location_id,
        ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom
      FROM checkins c
      JOIN locations l ON c.location_id = l.location_id
      WHERE user_id = ${user.user_id}
      ORDER BY checkin_time DESC
      LIMIT 1`;
      
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function getFriendList() {
  const user = await getAuthenticatedUser();
  try {
    const data = await sql<User[]>`
      SELECT u.user_id, u.username
      FROM users u
      WHERE u.user_id IN (
          SELECT friend_id FROM edges WHERE user_id = ${user.user_id}
          UNION
          SELECT user_id FROM edges WHERE friend_id = ${user.user_id}
      );`
      
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function getNearbySpot(bb?:string) {
  if (!bb) return [];
  const bbox = bb.split(',').map(Number);
  try {
    const data = await sql<Location[]>`
      SELECT
        l.location_id,
        ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom,
        COUNT(*) AS checkin_count
      FROM checkins c
      JOIN locations l ON c.location_id = l.location_id
      WHERE ST_Contains(
        ST_MakeEnvelope(${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}, 4326),
        l.geom
      )
      GROUP BY l.location_id
      ORDER BY checkin_count DESC
      LIMIT 50`;
  
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function getSpotRecommendation(bb:string) {
  const bbox = bb.split(',').map(Number);
  try {
    const data = await sql<Location[]>`
      SELECT
        l.location_id,
        ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom,
        COUNT(*) AS checkin_count
      FROM checkins c
      JOIN locations l ON c.location_id = l.location_id
      WHERE ST_Contains(
        ST_MakeEnvelope(${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}, 4326),
        l.geom
      )
      GROUP BY l.location_id
      ORDER BY checkin_count DESC
      LIMIT 50`;
  
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}

export async function getTopNearbySpotInFriendlist(userId: number, limit = 10) {
  try {
    const data = await sql<Location[]>`
      SELECT
        l.location_id,
        ST_AsGeoJSON(l.geom)::json AS geom,
        COUNT(*) AS checkin_count
      FROM checkins c
      JOIN locations l ON c.location_id = l.location_id
      WHERE c.user_id IN (
        SELECT friend_id
        FROM edges
        WHERE user_id = ${userId}
      )
      GROUP BY l.location_id
      ORDER BY checkin_count DESC
      LIMIT ${limit}`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch data.');
  }
}