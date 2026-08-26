# Local AI Bridge

Run this on the Windows PC that has Ollama.

1. Install Ollama.
2. Run `ollama pull qwen2.5:7b`.
3. Keep Ollama running.
4. Copy `.env.example` to `.env`.
5. Set a strong `BRIDGE_TOKEN`.
6. Run `start_windows.bat`.

Do not expose port 8787 directly to the public internet. Use a private VPN or secure tunnel such as Tailscale, company VPN, or a protected Cloudflare Tunnel.
