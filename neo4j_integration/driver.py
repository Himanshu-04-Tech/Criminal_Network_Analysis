"""Thread-safe Neo4j driver connection manager with pooling, lifecycle control, and retry resilience."""

from __future__ import annotations
import threading
from contextlib import contextmanager
from typing import Generator, Optional, Tuple
from neo4j import GraphDatabase, Driver, Session
from neo4j.exceptions import (
    ServiceUnavailable,
    AuthError,
    ConfigurationError,
    Neo4jError,
)

from neo4j_integration.config import Neo4jConfig, get_neo4j_config


class Neo4jDriverProvider:
    """Thread-safe singleton managing the underlying Neo4j driver pool."""

    _instance: Optional["Neo4jDriverProvider"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self, config: Optional[Neo4jConfig] = None):
        self._config = config or get_neo4j_config()
        self._driver: Optional[Driver] = None
        self._driver_lock = threading.Lock()

    @classmethod
    def get_instance(cls, config: Optional[Neo4jConfig] = None) -> "Neo4jDriverProvider":
        """Thread-safe accessor for driver provider."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(config=config)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Close active driver and reset singleton instance."""
        with cls._lock:
            if cls._instance is not None:
                cls._instance.close()
                cls._instance = None

    def get_driver(self) -> Driver:
        """Obtain or lazily initialize the active Neo4j driver instance."""
        if self._driver is None:
            with self._driver_lock:
                if self._driver is None:
                    auth = (self._config.username, self._config.password)
                    self._driver = GraphDatabase.driver(
                        self._config.uri,
                        auth=auth,
                        max_connection_lifetime=self._config.max_connection_lifetime,
                        max_connection_pool_size=self._config.max_connection_pool_size,
                        connection_acquisition_timeout=self._config.connection_acquisition_timeout,
                    )
        return self._driver

    def verify_connectivity(self) -> Tuple[bool, str]:
        """
        Verify database connectivity and credential validity without crashing.
        Returns (is_connected, message).
        """
        if not self._config.password:
            return False, "NEO4J_PASSWORD is not set in .env or environment."

        try:
            driver = self.get_driver()
            driver.verify_connectivity()
            # Verify specific database can be queried
            with driver.session(database=self._config.database) as session:
                res = session.run("RETURN 1 AS ping")
                rec = res.single()
                if rec and rec["ping"] == 1:
                    return True, f"Successfully connected to Neo4j database '{self._config.database}'."
            return True, f"Connected to DBMS, database: '{self._config.database}'."
        except AuthError as e:
            return False, f"Authentication failed: {str(e)}"
        except ServiceUnavailable as e:
            return False, f"Neo4j service unavailable at {self._config.uri}: {str(e)}"
        except ConfigurationError as e:
            return False, f"Neo4j configuration error: {str(e)}"
        except Neo4jError as e:
            return False, f"Neo4j database error: {str(e)}"
        except Exception as e:
            return False, f"Unexpected connection error: {str(e)}"

    @contextmanager
    def session(self, database: Optional[str] = None) -> Generator[Session, None, None]:
        """Context manager yielding a Neo4j session targeted at the configured database."""
        db_name = database or self._config.database
        driver = self.get_driver()
        sess = driver.session(database=db_name)
        try:
            yield sess
        finally:
            sess.close()

    def close(self) -> None:
        """Safely close active driver connections."""
        with self._driver_lock:
            if self._driver is not None:
                try:
                    self._driver.close()
                except Exception:
                    pass
                self._driver = None


# Convenience functional APIs
def get_driver(config: Optional[Neo4jConfig] = None) -> Driver:
    """Retrieve active Neo4j driver."""
    return Neo4jDriverProvider.get_instance(config=config).get_driver()


def close_driver() -> None:
    """Close active Neo4j driver."""
    Neo4jDriverProvider.get_instance().close()


def verify_connectivity(config: Optional[Neo4jConfig] = None) -> Tuple[bool, str]:
    """Verify Neo4j connectivity."""
    return Neo4jDriverProvider.get_instance(config=config).verify_connectivity()


@contextmanager
def get_session(database: Optional[str] = None) -> Generator[Session, None, None]:
    """Get scoped Neo4j session context manager."""
    with Neo4jDriverProvider.get_instance().session(database=database) as sess:
        yield sess
