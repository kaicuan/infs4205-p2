
# Web Application Project Documentation

## 1. Project Overview
### Motivation
This web application uses the Gowalla dataset to provide location-based insights via high-dimensional queries. It addresses challenges such as:
- Identifying spots within a geographic area.
- Finding nearby locations with minimum popularity thresholds.
- Recommending locations based on user preferences and social connections.

The main motivation behind this project is to demonstrate how spatial-temporal-social data can be queried efficiently using PostgreSQL with PostGIS.

### Web Application Functions
1. **Query 1:** Spots in Bounding Box<br>
Find visited locations within a the user's screen view
1. **Query 2:** Proximity-Based Spot Search<br>
Retrieves top-K nearest locations to a given point with at least N check-ins.
1. **Query 3:** Collaborative Filtering Recommendations<br>
Recommend locations based on check-in patterns of similar users (friends or shared interests)

---

## 2. Technology Stack
### Programming Languages & Frameworks
- Frontend & Backend: Next.js (React with TypeScript, Node.js)
- Database: PostgreSQL with PostGIS extension

### Packages & Dependencies
- leaflet: Map UI
- porsager/postgres.js: PostgreSQL connection and query execution
- shadcn/ui: UI components
- tailwind: CSS Styling
---

## 3. Setup Instructions
### Environment Setup
Install depedencies
```bash
npm install --force
```
Setup environment variable, fill in `.env`. Below is an example, change the field to match your database credential.
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=p2_s4829916
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# In macOS, can be generated by running: openssl rand -base64 32
# Alternatively, can use https://generate-secret.vercel.app/32
AUTH_SECRET=5391e64e4563fdea3e77dea61cdf8492
AUTH_TRUST_HOST=true
```

### Database Configuration
The following configuration is for Windows... Different OS may have different ways, but the point is to create a database, and run the file `setup.sql` inside the new database, and make sure that `setup.sql` has access to `loc-gowalla_edges.txt.gz` and `loc-gowalla_totalCheckins.txt.gz`
### 1. Download the dataset
Download the following files from [SNAP](https://snap.stanford.edu/data/loc-Gowalla.html):
- `loc-gowalla_edges.txt.gz`
- `loc-gowalla_totalCheckins.txt.gz`

### 2. Extract the datasets
Extract both `.gz` files into the project folder.

### 3. Open Command Prompt (CMD)
Navigate to the project folder and then connect to your PostgreSQL server:
```cmd
cd /path/to/project
psql -U username
```
*(Replace `username` with your actual PostgreSQL username. If you installed PostgreSQL locally, it might be `postgres`.)*

### 4. Create and connect to a new database
Inside the `psql` terminal, create a new database, and connect to the new database:
```sql
CREATE DATABASE database_name;
\c database_name
```

### 5. Set up the database schema
Run the `setup.sql` script:
```sql
\i setup.sql
```
*Note: Running this script may take a few minutes.*

---

## 4. Code Structure
### Frontend & Backend
This web app is based on NextJS App Routing. Codes are located at `/src/app`. Database actions/fetching are stored in `/src/app/lib`.

## 5. Queries Implemented
### Query 1: Spots within Bounding Box (screen view area)
The main functionality of this query is to get the spots within the bounding box, which is the screen view area. This feature is widely used in web and mobile mapping applications where users explore points of interest dynamically. As users pan or zoom on a map, the application sends the new viewport bounds to the backend, which then fetches only the necessary data.
To increase complexity and real-world relevance, I've added additional filtering dimensions:
- Temporal Filter : Restricts check-ins to a specified time range (start_date, end_date).
- Social Network Filter : Optionally limits results to spots visited by the user’s friends (friend_only=true), leveraging the edges table.

```sql
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
LIMIT ${K!};
```
**Variables**:  
- `bbox`: Bounding box coordinates.  
- `startStr/endStr`: Date range for filtering check-ins.  
- `friend_only`: Restricts check-ins to the user’s social
- `K`: Limiting the nubmer of spot to show (avoiding clutter in the UI) 

**Unexpected Value Handling**:  
- Returns empty list on invalid bounding box
- Invalid dates default to dataset bounds (`2009-02-04` to `2010-10-23`).  
- Invalid `K` defaults to 30 (max 100).  
- `friend_only` Other values other than true will default to false

### Query 2: Proximity-Based Spot Search
This query retrieves the K-nearest spots to a given geographic point that has at least N check-ins within a specified time range. It enables users to discover popular locations nearby , filtering out less-visited or irrelevant spots. This functionality is especially useful in real-world applications like recommending well-visited attractions near a user's current location. To increase complexity and real-world relevance, I've added additional filtering dimensions:
- Temporal Filter : Restricts check-ins to a specified time range (start_date, end_date).
- Social Network Filter : Optionally limits results to spots visited by the user’s friends (friend_only=true), leveraging the edges table.

```sql
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
ORDER BY geom <-> ST_SetSRID(ST_Point(${lon}, ${lat}), 4326)
LIMIT ${K!};
```  
**Variables**:  
- `lon/lat`: Center point for proximity search.  
- `N`: Minimum check-ins required.
- `startStr/endStr`: Date range for filtering check-ins.  
- `friend_only`: Restricts check-ins to the user’s social
- `K`: Limiting the nubmer of spot to show (avoiding clutter in the UI) 

**Unexpected Value Handling**:  
- Returns empty list on invalid `lon/lat`
- Invalid dates default to dataset bounds (`2009-02-04` to `2010-10-23`).  
- Invalid `K` defaults to 30 (max 100). Invalid `N` defaults to 50 (max 5000) 
- `friend_only` Other values other than true will default to false

### Query 3: Collaborative Filtering Recommendations 
This query recommends new locations that a user might be interested in, based on the check-in behavior of similar users , either within their social network or those who have visited similar places (collaborative filtering). This functionality mimics real-world recommendation systems, like Facebook or Instagram, where it suggests posts based on what people in your network engage with.
- Temporal Filter : Restricts check-ins to a specified time range (start_date, end_date).
- Social Network Filter : Optionally limits results to spots visited by the user’s friends (friend_only=true), leveraging the edges table.

```sql
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
LIMIT ${K!};
```
**Variables**: 
- `startStr/endStr`: Date range for filtering check-ins.  
- `friend_only`: Restricts check-ins to the user’s social
- `K`: Limiting the nubmer of spot to show (avoiding clutter in the UI) 

**Unexpected Value Handling**:  
- Invalid dates default to dataset bounds (`2009-02-04` to `2010-10-23`).  
- Invalid `K` defaults to 30 (max 100).  
- `friend_only` Other values other than true will default to false
---

## 6. How to Run the Application
Run via:
```bash
npm run build
npm run start
```
The web app should be running on: [https:\\localhost:3000](http://localhost:3000/). The web app will ask to login, and you can use any username from `user0` to `user196590` (E.g `user2025`).

---

## 7. Port Usage
[https:\\localhost:3000](http://localhost:3000/)

## 8. UI Address
[https:\\localhost:3000](http://localhost:3000/)

## 9. Additional Notes
- The development of this project is helped with Gen AI, including, but not limited to ChatGPT, Claude, Qwen.

---