"""Pytest configuration ensuring nexus-bharat is on pythonpath."""

import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent
nexus_bharat = root_dir / "nexus-bharat"

if str(nexus_bharat) not in sys.path:
    sys.path.insert(0, str(nexus_bharat))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
