import pymysql
from pymysql import Error

class MariaDBConnection:
    def __init__(self):
        self.connection = None
        self.host = "localhost"
        self.port = 3306
        self.user = "root"
        self.password = "root123"
        
    def connect(self, database=None):
        print(f"Attempting connection to {self.host}:{self.port} as {self.user}")
        try:
            self.connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=database,
                connect_timeout=5,
                autocommit=True
            )
            if self.connection:
                print("Connected to MariaDB successfully")
                # Verify connection by executing simple query
                with self.connection.cursor() as cursor:
                    cursor.execute("SELECT VERSION()")
                    version = cursor.fetchone()
                    print(f"MariaDB server version: {version[0]}")
                return self.connection
            return None
        except Error as e:
            print(f"Error connecting to MariaDB: {str(e)}")
            print(f"Connection parameters used: host={self.host}, port={self.port}, user={self.user}")
            print("Troubleshooting tips:")
            print("- Verify MariaDB service is running")
            print("- Check if user has proper privileges")
            print("- Confirm password is correct")
            print("- Try connecting with mysql command line client")
            return None
            
    def close(self):
        if self.connection:
            self.connection.close()
            print("Connection closed")
            
    def execute_query(self, query, params=None):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                self.connection.commit()
                return cursor
        except Error as e:
            print(f"Error executing query: {e}")
            return None
            
    def fetch_all(self, query, params=None):
        cursor = self.execute_query(query, params)
        if cursor:
            return cursor.fetchall()
        return None

# Example usage:
if __name__ == "__main__":
    db = MariaDBConnection()
    connection = db.connect()
    
    if connection:
        # Create database example
        db.execute_query("CREATE DATABASE IF NOT EXISTS mydatabase")
        
        # Switch to the new database
        db.execute_query("USE mydatabase")
        
        # Create table example
        db.execute_query("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE
            )
        """)
        
        # Insert example
        db.execute_query(
            "INSERT INTO users (name, email,dob) VALUES (%s, %s,%d)",
            ("John Doe", "john@example.com")
        )
        
        # Select example
        users = db.fetch_all("SELECT * FROM users")
        print("Users:", users)
        
        users = db.fetch_all("SELECT * FROM users")
        print("Users:", users)
        
        db.close()
