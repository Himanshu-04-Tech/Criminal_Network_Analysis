"""Root entrypoint for NEXUS-Bharat Intelligence Demos (Module 4 & Module 3)."""

import sys
import argparse
from pathlib import Path

root_dir = Path(__file__).resolve().parent
nexus_bharat_dir = root_dir / "nexus-bharat"
if str(nexus_bharat_dir) not in sys.path:
    sys.path.insert(0, str(nexus_bharat_dir))


def main():
    parser = argparse.ArgumentParser(description="NEXUS-Bharat Graph Intelligence Demonstration Runner")
    parser.add_argument(
        "--module",
        "-m",
        type=str,
        default="8",
        choices=["3", "4", "5", "6", "7", "8", "all"],
        help="Module demo to execute (default: 8 for Graph Diff Engine, 7 for Temporal Intelligence Engine, 6 for Case Fusion, 5 for Cross Case Intelligence, 4 for Network Role Intelligence, 3 for Hidden Connection Finder, all for all intelligence modules)",
    )
    args = parser.parse_args()

    if args.module == "3":
        from graph_analytics.demo import run_demo as run_m3_demo
        run_m3_demo()
    elif args.module == "4":
        from role_intelligence.demo import run_demo as run_m4_demo
        run_m4_demo()
    elif args.module == "5":
        from cross_case_intelligence.demo import run_demo as run_m5_demo
        run_m5_demo()
    elif args.module == "6":
        from case_fusion.demo import run_demo as run_m6_demo
        run_m6_demo()
    elif args.module == "7":
        from temporal_intelligence.demo import run_demo as run_m7_demo
        run_m7_demo()
    elif args.module == "8":
        from graph_diff.demo import run_demo as run_m8_demo
        run_m8_demo()
    elif args.module == "all":
        from graph_diff.demo import run_demo as run_m8_demo
        from temporal_intelligence.demo import run_demo as run_m7_demo
        from case_fusion.demo import run_demo as run_m6_demo
        from cross_case_intelligence.demo import run_demo as run_m5_demo
        from role_intelligence.demo import run_demo as run_m4_demo
        from graph_analytics.demo import run_demo as run_m3_demo
        run_m8_demo()
        print("\n" + "=" * 70 + "\n")
        run_m7_demo()
        print("\n" + "=" * 70 + "\n")
        run_m6_demo()
        print("\n" + "=" * 70 + "\n")
        run_m5_demo()
        print("\n" + "=" * 70 + "\n")
        run_m4_demo()
        print("\n" + "=" * 70 + "\n")
        run_m3_demo()
    else:
        from graph_diff.demo import run_demo as run_m8_demo
        run_m8_demo()


if __name__ == "__main__":
    main()
