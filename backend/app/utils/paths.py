import os
import shutil
import tempfile

def get_data_dir() -> str:
    """
    Returns a writable directory path for application data (connections, schema caches).
    On serverless platforms like Vercel where the application bundle is read-only,
    this automatically falls back to /tmp/bizquery_data and seeds default files.
    """
    custom_dir = os.getenv("DATA_DIR")
    if custom_dir:
        os.makedirs(custom_dir, exist_ok=True)
        return custom_dir

    # If running on Vercel or read-only filesystem
    if os.getenv("VERCEL"):
        data_dir = os.path.join(tempfile.gettempdir(), "bizquery_data")
        os.makedirs(data_dir, exist_ok=True)
        
        # Seed default business glossary and sample connections if available
        pkg_data = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
        if os.path.exists(pkg_data):
            for fname in ["business_glossary.json", "connections.json"]:
                src = os.path.join(pkg_data, fname)
                dst = os.path.join(data_dir, fname)
                if os.path.exists(src) and not os.path.exists(dst):
                    try:
                        shutil.copy2(src, dst)
                    except Exception:
                        pass
        return data_dir

    # Standard local filesystem directory
    local_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    try:
        os.makedirs(local_dir, exist_ok=True)
        return local_dir
    except (OSError, PermissionError):
        data_dir = os.path.join(tempfile.gettempdir(), "bizquery_data")
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
