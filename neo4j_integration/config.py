"""Configuration manager for Neo4j database connectivity with safe credential handling."""

from __future__ import annotations
import os
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv


def _load_environment() -> None:
    """Load environment variables from nearest .env file."""
    # Look in current working directory, workspace root, and module parents
    current_file = Path(__file__).resolve()
    candidates = [
        Path.cwd() / ".env",
        current_file.parent.parent / ".env",
        current_file.parent / ".env",
    ]
    for env_path in candidates:
        if env_path.is_file():
            load_dotenv(dotenv_path=env_path, override=False)
            break
    else:
        load_dotenv()


_load_environment()


@dataclass(frozen=True)
class Neo4jConfig:
    """Immutable configuration container for Neo4j database connection."""
    uri: str
    username: str
    password: str
    database: str
    max_connection_lifetime: int = 3600
    max_connection_pool_size: int = 50
    connection_acquisition_timeout: float = 30.0

    @classmethod
    def from_env(cls) -> "Neo4jConfig":
        """Construct configuration from environment variables with safe defaults."""
        _load_environment()
        uri = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687").strip()
        username = os.getenv("NEO4J_USERNAME", "neo4j").strip()
        password = os.getenv("NEO4J_PASSWORD", "").strip()
        database = os.getenv("NEO4J_DATABASE", "nexus_bharat").strip()

        return cls(
            uri=uri,
            username=username,
            password=password,
            database=database,
        )

    def is_configured(self) -> bool:
        """Check if connection credentials are provided."""
        return bool(self.uri and self.username and self.password)

    def __repr__(self) -> str:
        """Safe string representation masking the password."""
        masked_pwd = "***" if self.password else "<EMPTY>"
        return (
            f"Neo4jConfig(uri='{self.uri}', username='{self.username}', "
            f"password={masked_pwd}, database='{self.database}')"
        )

    def __str__(self) -> str:
        return self.__repr__()


_config_instance: Optional[Neo4jConfig] = None


def get_neo4j_config(reload: bool = False) -> Neo4jConfig:
    """Retrieve singleton configuration instance."""
    global _config_instance
    if _config_instance is None or reload:
        _config_instance = Neo4jConfig.from_env()
    return _config_instance
