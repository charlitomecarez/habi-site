#!/usr/bin/env bash
# Render the Habi ads and site clips with HyperFrames.
#   ./render.sh            every ad, final quality
#   ./render.sh home       one ad
#   QUALITY=draft ./render.sh home
# HyperFrames comes from the video-editing-workflow repo (tools/setup.sh --animated-graphics).
# Point HF at another install if yours lives elsewhere.
set -euo pipefail
cd "$(dirname "$0")"
HF="${HF:-$HOME/Documents/GitHub/video-editing-workflow/tools/graphics/animated/node_modules/.bin/hyperframes}"
QUALITY="${QUALITY:-delivery}"
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1

if [[ ! -x "$HF" ]]; then
  echo "HyperFrames not found at $HF" >&2
  echo "Install it in video-editing-workflow with: tools/setup.sh --animated-graphics" >&2
  exit 1
fi

ads=("$@")
if [[ ${#ads[@]} -eq 0 ]]; then
  ads=(master home todos vault money vehicle todos-card vault-card home-screen)
fi

mkdir -p renders
for ad in "${ads[@]}"; do
  echo "▶ $ad ($QUALITY)"
  "$HF" render -c "compositions/$ad.html" -q "$QUALITY" --fps 30 -o "renders/habi-$ad.mp4" . 2>&1 | grep -E "Render complete|rendered in|Error|error" || true
done
