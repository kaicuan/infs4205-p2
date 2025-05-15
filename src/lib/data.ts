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

export async function getPopularSpots(
  bb?: string,
  K?: string,
  start_date?: string,
  end_date?: string,
  friend_only?: string,
) {
  const user = await getAuthenticatedUser();
  
  if (!bb) return [];
  const bbox = bb.split(',').map(Number);
  if (
    isNaN(bbox[0]) || isNaN(bbox[1]) || isNaN(bbox[2]) || isNaN(bbox[3]) ||
    bbox[1] < -90 || bbox[1] > 90 || bbox[3] < -90 || bbox[3] > 90 ||
    bbox[0] < -180 || bbox[0] > 180 || bbox[2] < -180 || bbox[2] > 180
  ) {
    return [];
  }
  
  const int_K = parseInt(K || "-1");
  if (isNaN(int_K) || int_K <= 0) {
    K = "30"
  } else if (int_K > 100) {
    K = "100"
  }

  let startDate = new Date(start_date || '2009-02-04');
  if (isNaN(startDate.getTime())) {
    startDate = new Date('2009-02-04');
  }
  const startStr = startDate.toISOString().slice(0, 10);

  let endDate = new Date(end_date || '2010-10-23');
  if (isNaN(endDate.getTime())) {
    endDate = new Date('2010-10-23');
  }
  const endStr = endDate.toISOString().slice(0, 10);

  if (friend_only !== "true") {
    friend_only = undefined;
  }

  try {
    const data = await sql<Location[]>`
    SELECT
      l.location_id,
      ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom,
      COUNT(*) AS checkin_count
    FROM checkins c
    JOIN locations l ON c.location_id = l.location_id
    WHERE
      ST_Contains(
        ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326),
        l.geom
      )
      AND c.checkin_time BETWEEN ${startStr} AND ${endStr}
      ${Boolean(friend_only)
        ? sql`AND c.user_id IN (
              SELECT friend_id FROM edges WHERE user_id = ${user.user_id}
              UNION
              SELECT user_id FROM edges WHERE friend_id = ${user.user_id}
            )`
        : sql``}
    GROUP BY l.location_id
    ORDER BY checkin_count DESC
    LIMIT ${K!}
  `;

  return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch popular spots.');
  }
}

export async function getSpotByProximity(
  c?: string,
  K?: string,
  N?: string,
  start_date?: string,
  end_date?: string,
  friend_only?: string,
): Promise<Location[]> {
  const user = await getAuthenticatedUser();

  if (!c) return [];
  const [latStr, lonStr] = c.split(',');
  const lon = parseFloat(lonStr);
  const lat = parseFloat(latStr);
  if (
    isNaN(lon) || isNaN(lat) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    return [];
  }

  const int_K = parseInt(K || "-1");
  if (isNaN(int_K) || int_K <= 0) {
    K = "30"
  } else if (int_K > 100) {
    K = "100"
  }

  const int_N = parseInt(N || "-1");
  if (isNaN(int_N) || int_N <= 0) {
    N = "50"
  } else if (int_K > 100) {
    N = "100"
  }

  let startDate = new Date(start_date || '2009-02-04');
  if (isNaN(startDate.getTime())) {
    startDate = new Date('2009-02-04');
  }
  const startStr = startDate.toISOString().slice(0, 10);

  let endDate = new Date(end_date || '2010-10-23');
  if (isNaN(endDate.getTime())) {
    endDate = new Date('2010-10-23');
  }
  const endStr = endDate.toISOString().slice(0, 10);

  if (friend_only !== "true") {
    friend_only = undefined;
  }

  try {
    const data = await sql<Location[]>`
      SELECT
        l.location_id,
        ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom,
        COUNT(*) AS checkin_count
      FROM checkins c
      JOIN locations l ON c.location_id = l.location_id
      WHERE
        c.checkin_time BETWEEN ${startStr} AND ${endStr}
        ${friend_only ? sql`
          AND c.user_id IN (
            SELECT friend_id FROM edges WHERE user_id = ${user.user_id}
            UNION
            SELECT user_id FROM edges WHERE friend_id = ${user.user_id}
          )
        ` : sql``}
      GROUP BY l.location_id
      HAVING COUNT(*) >= ${N!}
      ORDER BY ST_FlipCoordinates(l.geom) <-> ST_SetSRID(ST_Point(${lon}, ${lat}), 4326)
      LIMIT ${K!}
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch nearest spots to the center.');
  }
}

export async function getRecommendedSpots(
  K?: string,
  start_date?: string,
  end_date?: string,
  friend_only?: string
): Promise<Location[]> {
  const user = await getAuthenticatedUser();

  const int_K = parseInt(K || "-1");
  if (isNaN(int_K) || int_K <= 0) {
    K = "30"
  } else if (int_K > 100) {
    K = "100"
  }

  let startDate = new Date(start_date || '2009-02-04');
  if (isNaN(startDate.getTime())) {
    startDate = new Date('2009-02-04');
  }
  const startStr = startDate.toISOString().slice(0, 10);

  let endDate = new Date(end_date || '2010-10-23');
  if (isNaN(endDate.getTime())) {
    endDate = new Date('2010-10-23');
  }
  const endStr = endDate.toISOString().slice(0, 10);

  if (friend_only !== "true") {
    friend_only = undefined;
  }

  try {
    const data = await sql<Location[]>`
      WITH user_checkins AS (
        SELECT DISTINCT location_id
        FROM checkins
        WHERE user_id = ${user.user_id}
          AND checkin_time BETWEEN ${startStr} AND ${endStr}
      ),
      similar_users AS (
        SELECT DISTINCT c.user_id
        FROM checkins c
        INNER JOIN user_checkins uc ON c.location_id = uc.location_id
        WHERE c.user_id != ${user.user_id}
          AND c.checkin_time BETWEEN ${startStr} AND ${endStr}
          ${friend_only ? sql`
            AND c.user_id IN (
              SELECT friend_id FROM edges WHERE user_id = ${user.user_id}
              UNION
              SELECT user_id FROM edges WHERE friend_id = ${user.user_id}
            )
          ` : sql``}
      ),
      recommended_checkins AS (
        SELECT c.location_id
        FROM checkins c
        INNER JOIN similar_users su ON c.user_id = su.user_id
        WHERE c.checkin_time BETWEEN ${startStr} AND ${endStr}
          AND c.location_id NOT IN (SELECT location_id FROM user_checkins)
      )
      SELECT
        l.location_id,
        ST_AsGeoJSON(ST_FlipCoordinates(l.geom))::json AS geom,
        COUNT(*) AS checkin_count
      FROM recommended_checkins rc
      JOIN locations l ON rc.location_id = l.location_id
      GROUP BY l.location_id
      ORDER BY checkin_count DESC
      LIMIT ${K!}
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recommended spots.');
  }
}