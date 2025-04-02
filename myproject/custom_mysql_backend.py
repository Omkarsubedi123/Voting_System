from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures as MySQLDatabaseFeatures

class DatabaseFeatures(MySQLDatabaseFeatures):
    @property
    def has_native_uuid_field(self):
        # Override to prevent version check
        return True

class DatabaseWrapper(MySQLDatabaseWrapper):
    features_class = DatabaseFeatures
