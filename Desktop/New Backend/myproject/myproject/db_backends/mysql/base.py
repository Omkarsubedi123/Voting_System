from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures as MySQLDatabaseFeatures

class DatabaseFeatures(MySQLDatabaseFeatures):
    @property
    def has_native_uuid_field(self):
        # Override to prevent version check
        return True
        
    @property
    def can_return_columns_from_insert(self):
        # Disable RETURNING clause support
        return False

class DatabaseWrapper(MySQLDatabaseWrapper):
    features_class = DatabaseFeatures
    
    def check_database_version_supported(self):
        # Override to bypass version check
        pass
