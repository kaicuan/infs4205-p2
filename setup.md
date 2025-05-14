### 1. Download the dataset
Download the following files from [SNAP](https://snap.stanford.edu/data/loc-Gowalla.html):
- `loc-gowalla_edges.txt.gz`
- `loc-gowalla_totalCheckins.txt.gz`

### 2. Extract the datasets
Extract both `.gz` files into the project folder.

### 3. Open Command Prompt (CMD)
Navigate to the project folder and then connect to your PostgreSQL server::
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