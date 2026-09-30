---
name: jellyfin-optimize
description: >
  Optimize video files in the current directory for direct playback on the
  Jellyfin Roku client. Use when the user runs /jellyfin-optimize or asks to
  transcode/convert/remux movies for Jellyfin before uploading.
---

# Jellyfin Optimize

Remux video files in the current directory to MP4 so the Jellyfin **Roku**
client direct-plays them without stutter and seeks cleanly. Originals are
overwritten on success only. Run per directory; do not recurse.

## Why MP4

The Roku client mishandles **MKV**: playback stutters (constantly skipped
frames) and, on a Direct streaming session, seek leaves a frozen picture while
the timeline keeps running. The same streams in **MP4** play smoothly and seek
correctly. This is a container problem - re-encoding the video does not fix it.

## Target profile (Roku Ultra 4800X)

| Element | Accepted by client |
|---------|--------------------|
| Container | `mp4` (required; MKV stutters and freezes seek) |
| Video | HEVC/H.265 or H.264, SDR or HDR - copy as-is |
| Audio | AAC / AC3 / EAC3 - copy as-is |
| Subtitles | text only (SRT/ASS/VTT), converted to `mov_text`; drop PGS/VOBSUB |

Video and audio are almost always copied, not re-encoded. Do not transcode a
codec the Roku already plays.

## Steps

1. List video files in cwd only: `*.mkv *.mp4 *.avi *.mov *.m4v *.webm`.
   - None -> report `No video files in {cwd}`, stop.
2. For each file, probe:
   ```
   ffprobe -v error -print_format json -show_streams -show_format "<file>"
   ```
   Read: video `codec_name`; audio `codec_name`, `channels`; subtitle
   `codec_name` per track.
3. **Skip** only if the file is MP4 AND video is HEVC/H.264 AND every audio
   track is AAC/AC3/EAC3 AND every subtitle is already text. Print
   `already optimal`, no write.
4. Remux to MP4 (video + audio copied):
   ```
   ffmpeg -y -i "<in>" -map 0:v:0 -map 0:a -map "0:s?" \
     -c:v copy -c:a copy -c:s mov_text -movflags +faststart "<tmp>.mp4"
   ```
   - `-movflags +faststart` moves the moov atom to the front for instant start.
   - `-c:s mov_text` converts text subtitles to MP4's subtitle format.

### Unsupported codecs

Only re-encode when the Roku cannot decode a stream:
- Video not HEVC/H.264 (e.g. VC-1, MPEG-2): `-c:v hevc_videotoolbox -q:v 55`
  (Mac) or `-c:v libx265 -preset faster -crf 20`.
- Audio not AAC/AC3/EAC3 (e.g. DTS, TrueHD): `-c:a aac -b:a 640k`.

### Image subtitles

`mov_text` cannot carry bitmap subtitles. If any track is
`hdmv_pgs_subtitle`, `dvd_subtitle`, or `dvb_subtitle`, drop it by mapping only
text subtitle indices instead of `-map "0:s?"`.

### Sidecar subtitles

For each `"<basename>.<lang>.srt"` beside the input (`<lang>` = `en`, `eng`,
`fr`...): add `-map "<sidecar>"` after the input maps, keep `-c:s mov_text`,
`-metadata:s:s:<n> language=<lang>`, and mark the first subtitle
`-disposition:s:0 default`.

## Rules
- Never re-encode video or audio the Roku already supports; copy it.
- Never pass `-map 0` (would copy image subs and data streams).
- Keep all audio tracks.
- Fail the file if ffmpeg exits non-zero; never leave a partial output.

## In-place safety

- Write to `"<name>.jellyfin.mp4"` in the same directory.
- On ffmpeg exit 0: remove the original (whatever its extension), then rename
  the temp to `"<name>.mp4"`.
- On any failure: delete the temp, keep the original, report the error.
- After success, move consumed sidecar `.srt` files to `./_embedded_subs/`
  (create dir) so Jellyfin does not show duplicate external + embedded subs.

## Output

Print a summary table:

```
File            Action   Video            Audio       Subs         Size
movie.mkv       remux    hevc copy        aac copy    +en.srt      4.1G->4.1G
movie2.avi      remux    mpeg2->hevc      ac3 copy    dropped pgs  8.0G->4.2G
```

Report `already optimal` rows without writing.

## Notes

- Remux is a stream copy: a 90-minute movie converts in seconds, with no quality
  loss. There is no reason to re-encode a supported codec.
- HDR10/DV: HEVC HDR copies through unchanged; the Roku direct-plays HDR.
- Requires `ffmpeg`/`ffprobe` on PATH (Homebrew on this Mac).
