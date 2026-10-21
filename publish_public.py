#!/usr/bin/env python3
"""Publish the website to the PUBLIC project.

The working project (this one) is private: it holds the lesson content, notes, planning and paperwork.
The public project holds only the built website (`web/`), the publish workflow and a short README.
Pushing to the public project's `main` branch publishes the site (about a minute later).

Usage:
    python3 publish_public.py /path/to/clone-of-the-public-project           # build, copy, commit, push
    python3 publish_public.py /path/to/clone-of-the-public-project --no-push # build, copy, commit only
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run(cmd, cwd=None, check=True):
    result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode != 0:
        sys.exit(f"Command failed: {' '.join(cmd)}\n{result.stdout}{result.stderr}")
    return result


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    push = "--no-push" not in sys.argv
    if len(args) != 1:
        sys.exit(__doc__)
    dest = Path(args[0]).resolve()
    if not (dest / ".git").exists():
        sys.exit(f"{dest} is not a git clone of the public project.")
    if dest == ROOT:
        sys.exit("The destination must be the PUBLIC project, not this one.")

    # 1. Rebuild the data files; stop if the content has problems.
    build = run([sys.executable, "build_data.py"], cwd=ROOT, check=False)
    if build.returncode != 0:
        sys.exit("build_data.py found problems; fix them first:\n" + build.stdout)

    # 2. Copy exactly what the public project should hold, and nothing else.
    shutil.rmtree(dest / "web", ignore_errors=True)
    shutil.copytree(ROOT / "web", dest / "web", ignore=shutil.ignore_patterns("__pycache__", ".DS_Store", "*.pyc"))
    (dest / ".github" / "workflows").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "public" / "pages.yml", dest / ".github" / "workflows" / "pages.yml")
    shutil.copy2(ROOT / "public" / "README.md", dest / "README.md")

    # 3. Commit (with a neutral message, so no private notes leak) and push.
    head = run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT).stdout.strip()
    run(["git", "add", "-A"], cwd=dest)
    if run(["git", "diff", "--cached", "--quiet"], cwd=dest, check=False).returncode == 0:
        print("Nothing new to publish.")
        return
    run(["git", "commit", "-q", "-m", f"Publish site update ({head})"], cwd=dest)
    if push:
        run(["git", "push", "origin", "HEAD:main"], cwd=dest)
        print("Pushed. The site updates in about a minute.")
    else:
        print("Committed in the public clone (not pushed).")


if __name__ == "__main__":
    main()
