---
name: jellyfin-optimize
description: >
  Optimize video files in the current directory for direct playback on the
  Jellyfin Roku client. Use when the user runs /jellyfin-optimize or asks to
  transcode/convert/remux movies for Jellyfin before uploading.
---

# Jellyfin Optimize

Convert video files in the current directory to a form the Jellyfin **Roku**
client direct-plays, so the server never transcodes. Originals are overwritten
on success only. Run per directory; do not recurse.

## Target profile (Roku Ultra 4800X)

| Element | Accepted by client |
|---------|--------------------|
| Container | `mkv` preferred |
| Video | HEVC/H.265 SDR `main`/`main10`, <= 40 Mbps — OR H.264 <= 10 Mbps, level <= 4.2, 8-bit, SDR |
| Video GOP | HEVC: closed GOP, IDR keyframes <= 2 s apart, VPS repeated at every keyframe (see Seek safety). H.264: no added constraint |
| Audio | AC3 / EAC3 (multichannel). AAC only if <= 2 channels |
| Subtitles | text only (SRT/ASS/VTT). PGS/VOBSUB force burn-in -> transcode, so drop them |

## Seek safety (HEVC required)

The Roku decoder re-initialises at the seek point. If the HEVC parameter sets are
not present in-band there, it decodes nothing: the picture freezes while the
timeline keeps running. A file can direct-play perfectly yet freeze on
fast-forward. A seek-safe HEVC stream must have:

- closed GOP (keyframes are IDR, not CRA/open-GOP)
- IDR keyframes <= 2 s apart
- VPS repeated at every keyframe

Hardware encoders (e.g. VideoToolbox) can emit low-delay streams with parameter
sets only once at the start of the file. That is the usual cause of this freeze.
H.264 keeps its SPS in container extradata and has no observed seek issue.

## Steps

1. List video files in cwd only: `*.mkv *.mp4 *.avi *.mov *.m4v *.webm`.
   - None -> report `No video files in {cwd}`, stop.
2. For each file, probe:
   ```
   ffprobe -v error -print_format json -show_streams -show_format "<file>"
   ```
   Read: video `codec_name`, `bit_rate`, `level`, `bits_per_raw_sample`/`pix_fmt`,
   `color_transfer` (HDR if `smpte2084`/`arib-std-b67`); audio `codec_name`,
   `channels`; subtitle `codec_name`.
3. **Skip** only if BOTH hold:
   a. Container/video/audio/subs compliant (HEVC SDR <= 40 Mbps or H.264 <= 10 Mbps
      level <= 42 SDR, audio AC3/EAC3 or AAC <= 2ch, all subs text), AND
   b. Seek-safe per the probe below (HEVC only; H.264 always passes).
   Print `already optimal`, no write.
4. Decide video action:
   - `copy` when video is HEVC SDR <= 40 Mbps (or H.264 <= 10 Mbps, level <= 42,
     8-bit, SDR) AND seek-safe.
   - `encode` otherwise (`libx265`, closed GOP). This includes copy-eligible video
     whose GOP is not seek-safe: a remux cannot add keyframes, so it must be
     re-encoded.
5. Build the ffmpeg command.

### Seek-safety probe (HEVC only)

The freeze bug is HEVC-specific. H.264 keeps its SPS in container extradata and
has no observed seek issue, so a compliant H.264 file is always seek-safe.

For HEVC, scan a bounded window (first 40 s is enough for a normal movie) and
require: no CRA (`nal_unit_type: 21`), VPS at least as numerous as IDR frames,
at least two keyframes in the window, and max keyframe gap <= 2 s.

```
win=40
codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "<file>")
if [ "$codec" = hevc ]; then
  trace=$(ffmpeg -v trace -t $win -i "<file>" -c copy -bsf:v trace_headers -f null - 2>&1)
  ps=$(printf '%s\n' "$trace" | grep -cE 'nal_unit_type: 32')   # VPS
  cra=$(printf '%s\n' "$trace" | grep -cE 'nal_unit_type: 21')  # CRA
  pkts=$(ffprobe -v error -select_streams v -read_intervals "%+${win}" \
    -show_entries packet=pts_time,flags -of csv=p=0 "<file>")
  kf=$(printf '%s\n' "$pkts" | grep -c ',K')
  gap=$(printf '%s\n' "$pkts" \
    | awk -F, '$2 ~ /K/ {if(prev!=""){g=$1-prev; if(g>max)max=g} prev=$1} END{printf "%.1f", max+0}')
  # seek-safe when cra == 0 && kf >= 2 && ps >= kf && gap <= 2
fi
```

### Remux (video copy)
```
ffmpeg -y -i "<in>" -map 0:v:0 -map 0:a -map "0:s?" \
  -c:v copy -c:a eac3 -b:a 640k -c:s srt "<tmp>.mkv"
```
If audio is already AC3/EAC3 (or AAC <= 2ch), use `-c:a copy` instead of eac3.

### Re-encode (unsupported or non-seek-safe video)
```
ffmpeg -y -i "<in>" -map 0:v:0 -map 0:a -map "0:s?" \
  -c:v libx265 -preset faster -crf 20 \
  -x265-params "open-gop=0:repeat-headers=1:scenecut=0:keyint=48:min-keyint=1" \
  -force_key_frames "expr:gte(t,n_forced*2)" \
  -c:a eac3 -b:a 640k -c:s srt "<tmp>.mkv"
```
`open-gop=0` is what forces IDR keyframes (no CRA); `min-keyint=1` is inert with
`scenecut=0` and kept only for clarity. For HDR10 input keep 10-bit and tag the
output by appending to the x265 params (ffmpeg's `-color_*` flags alone do not
stick):
```
-pix_fmt yuv420p10le \
-x265-params "open-gop=0:repeat-headers=1:scenecut=0:keyint=48:min-keyint=1:main10=1:colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc"
```
`-preset faster` is the default; use `medium` for better quality at roughly 1/3
the speed. Dolby Vision RPU is lost on re-encode (falls back to HDR10).

### Sidecar subtitles
For each `"<basename>.<lang>.srt"` beside the input (`<lang>` = `en`, `eng`, `fr`...):
- add `-map "<sidecar>"` after the input maps
- `-c:s srt`
- `-metadata:s:s:<n> language=<lang>`
- mark the first subtitle `-disposition:s:0 default`

## Rules
- A video-copy remux does NOT make a file seek-safe; if the probe fails, re-encode.
- Keep embedded text subtitle tracks (`-map "0:s?"` + `-c:s srt`); drop image subs
  (`hdmv_pgs_subtitle`, `dvd_subtitle`, `dvb_subtitle`) by mapping only text indices.
- Audio: keep all tracks; multichannel non-AC3/EAC3 -> `eac3 -b:a 640k`.
- Never pass `-map 0` (would copy image subs and data streams).
- After encoding, re-run the seek-safety probe on `<tmp>.mkv` and fail the file
  if it is not seek-safe.

## In-place safety

- Encode to `"<name>.jellyfin.mkv"` in the same directory.
- On ffmpeg exit 0: if input was not already `"<name>.mkv"`, `rm` the original, then
  `mv` the temp to `"<name>.mkv"`.
- On any failure: delete the temp, keep the original, report the error.
- After success, move consumed sidecar `.srt` files to `./_embedded_subs/`
  (create dir) so Jellyfin does not show duplicate external + embedded subs.

## Output

Print a summary table:

```
File            Action   Video              Audio       Subs        Size
movie.mkv       remux    hevc 2363k copy    aac->eac3   +en.srt     4.1G->4.0G
movie2.mkv      encode   h264->hevc         ac3 copy    dropped pgs 8.0G->5.2G
movie3.mkv      encode   hevc->hevc (seek)  eac3 copy   -           3.9G->3.1G
```

Report `already optimal` rows without writing.

## Notes

- `libx265` is a CPU encoder: `-preset faster` is slower than hardware but is
  required for the closed-GOP + repeated-header stream the Roku needs to seek.
  `-crf 20` is a starting quality point (lower = better quality, larger).
- HDR10/DV: keep 10-bit with `-pix_fmt yuv420p10le` and the `main10=1` x265
  param; the Roku direct-plays HDR, so no tone mapping. Flag HDR files in the
  summary.
- Requires `ffmpeg`/`ffprobe` on PATH (Homebrew on this Mac).
