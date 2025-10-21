```sql
CREATE TABLE branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,         -- Unique branch code
    name VARCHAR(100) NOT NULL,               -- Branch name
    address VARCHAR(255),                     -- Full address
    latitude DECIMAL(10,8) DEFAULT NULL,      -- Latitude for map/GPS
    longitude DECIMAL(11,8) DEFAULT NULL,     -- Longitude for map/GPS
    manager_id BIGINT UNSIGNED DEFAULT NULL,  -- FK to employees or users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)  -- or users(id) if managers are in a users table
);
```
