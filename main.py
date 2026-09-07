"""Root entrypoint for NEXUS-Bharat. Defaults to Module 2 (Knowledge Graph Engine)."""

import sys
from pathlib import Path

# Add nexus-bharat to sys.path
root_dir = Path(__file__).resolve().parent
nexus_bharat_dir = root_dir / "nexus-bharat"
if str(nexus_bharat_dir) not in sys.path:
    sys.path.insert(0, str(nexus_bharat_dir))

if __name__ == "__main__":
    if "--generate" in sys.argv or "--module-1" in sys.argv or "--module1" in sys.argv:
        from dataset_generator.main import run_pipeline
        run_pipeline()
    else:
        from graph_engine.main import run_cli_demo
        run_cli_demo()

