import os

PORT = int(os.environ.get("PORT", 8080))   # Gunakan port dari Replit
server = http.server.HTTPServer(("0.0.0.0", PORT), YDrizzHandler)

print(f"✅ Server berjalan di http://0.0.0.0:{PORT}")
