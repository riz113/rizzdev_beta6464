#!/usr/bin/env python3
import http.server
import json
import os          # <-- ditambahkan untuk mengambil PORT dari environment
import subprocess
import sys
import urllib.parse
import threading
import webbrowser
import re
import tempfile
import time
from http import HTTPStatus

def install_ytdlp():
    try:
        import yt_dlp
        print("✓ yt-dlp ready")
        return True
    except ImportError:
        print("⟳ Installing yt-dlp...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
        return True

install_ytdlp()
import yt_dlp

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except:
        return False

FFMPEG_OK = check_ffmpeg()
print(f"FFmpeg available: {FFMPEG_OK}")

# Rate limiting
req_counts = {}
def is_rate_limited(ip):
    now = time.time()
    req_counts[ip] = [t for t in req_counts.get(ip, []) if now - t < 60]
    if len(req_counts[ip]) >= 10:
        return True
    req_counts[ip].append(now)
    return False

class YDrizzHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_file(self, path, content_type="text/html"):
        try:
            with open(path, "rb") as f:
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(os.path.getsize(path)))
                self.end_headers()
                self.wfile.write(f.read())
        except FileNotFoundError:
            self.send_json({"error": "File not found"}, 404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ("/", "/index.html"):
            idx = os.path.join(os.path.dirname(__file__), "index.html")
            self.send_file(idx)
        elif parsed.path == "/info":
            if is_rate_limited(self.client_address[0]):
                self.send_json({"error": "Too many requests"}, 429)
                return
            qs = urllib.parse.parse_qs(parsed.query)
            url = qs.get("url", [""])[0]
            if not url:
                self.send_json({"error": "URL empty"}, 400)
                return
            try:
                ydl_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    formats = []
                    combined_set = set()
                    video_only_set = set()
                    for f in info.get("formats", []):
                        vcodec = f.get("vcodec")
                        acodec = f.get("acodec")
                        height = f.get("height")
                        if not height:
                            continue
                        if vcodec != "none" and acodec != "none":
                            if height not in combined_set:
                                combined_set.add(height)
                                label = f"{height}p MP4"
                                formats.append({"id": f["format_id"], "label": label, "type": "combined"})
                        elif vcodec != "none" and acodec == "none":
                            if height not in video_only_set:
                                video_only_set.add(height)
                                label = f"{height}p (video only) MP4"
                                formats.append({"id": f["format_id"], "label": label, "type": "video_only"})
                    formats.append({"id": "bestaudio/best", "label": "Audio MP3", "type": "audio"})
                    def sort_key(f):
                        if f["type"] == "audio":
                            return 999
                        match = re.search(r'(\d+)p', f["label"])
                        return -int(match.group(1)) if match else 0
                    formats.sort(key=sort_key)
                    self.send_json({
                        "title": info.get("title", "Unknown"),
                        "channel": info.get("uploader", "Unknown"),
                        "duration": info.get("duration_string", "N/A"),
                        "thumbnail": info.get("thumbnail", ""),
                        "view_count": f"{info.get('view_count', 0):,}",
                        "formats": formats,
                        "ffmpeg": FFMPEG_OK
                    })
            except Exception as e:
                self.send_json({"error": str(e)}, 500)
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        if self.path == "/download":
            if is_rate_limited(self.client_address[0]):
                self.send_json({"error": "Too many requests"}, 429)
                return
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            url = body.get("url")
            fmt_id = body.get("format_id")
            if not url or not fmt_id:
                self.send_json({"error": "Missing url or format"}, 400)
                return
            try:
                with tempfile.TemporaryDirectory() as tmpdir:
                    outtmpl = os.path.join(tmpdir, "%(title)s.%(ext)s")
                    if fmt_id == "bestaudio/best":
                        ydl_opts = {
                            "format": "bestaudio/best",
                            "outtmpl": outtmpl,
                            "quiet": True,
                            "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
                            "restrictfilenames": True
                        }
                    else:
                        ydl_opts = {
                            "format": fmt_id,
                            "outtmpl": outtmpl,
                            "quiet": True,
                            "merge_output_format": "mp4",
                            "restrictfilenames": True
                        }
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(url, download=True)
                        filename = ydl.prepare_filename(info)
                        if fmt_id == "bestaudio/best":
                            filename = os.path.splitext(filename)[0] + ".mp3"
                        if os.path.exists(filename):
                            safe_title = re.sub(r'[\\/*?:"<>|]', "", info.get("title", "video"))
                            ext = ".mp3" if fmt_id == "bestaudio/best" else ".mp4"
                            suggested = f"{safe_title}{ext}"
                            with open(filename, "rb") as f:
                                data = f.read()
                            self.send_response(200)
                            self.send_header("Content-Type", "application/octet-stream")
                            self.send_header("Content-Disposition", f'attachment; filename="{suggested}"')
                            self.send_header("Content-Length", len(data))
                            self.end_headers()
                            self.wfile.write(data)
                        else:
                            raise Exception("File not found after download")
            except yt_dlp.utils.DownloadError as e:
                err = str(e)
                if "ffmpeg" in err.lower() and not FFMPEG_OK:
                    err = "FFmpeg tidak terinstall. Install FFmpeg untuk download video HD atau audio MP3."
                self.send_json({"error": err}, 500)
            except Exception as e:
                self.send_json({"error": str(e)}, 500)
        else:
            self.send_json({"error": "Not found"}, 404)

# ================== PERUBAHAN UTAMA ==================
# Ambil port dari environment variable (Render) atau default 7070
PORT = int(os.environ.get("PORT", 7070))
# Bind ke 0.0.0.0 agar bisa diakses dari luar
server = http.server.HTTPServer(("0.0.0.0", PORT), YDrizzHandler)
# =====================================================

def open_browser():
    time.sleep(1)
    webbrowser.open(f"http://localhost:{PORT}")

print("\n" + "="*50)
print(" YDrizz - YouTube Downloader (MP4 / MP3)")
print("="*50)
print(f" Server: http://localhost:{PORT}")
print(f" FFmpeg: {'✅ Tersedia (support merge)' if FFMPEG_OK else '❌ Tidak ada (video HD hanya video only)'}")
print(" Tekan Ctrl+C untuk berhenti\n")

# Buka browser hanya jika di local (bukan di cloud)
if os.environ.get("RENDER") is None:
    threading.Thread(target=open_browser, daemon=True).start()

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nServer dihentikan.")
    server.server_close()
