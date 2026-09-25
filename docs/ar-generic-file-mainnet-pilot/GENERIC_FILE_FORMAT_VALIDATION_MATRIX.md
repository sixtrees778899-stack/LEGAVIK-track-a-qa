# Generic File Format Validation Matrix

| Type | Extension | Required MIME | Content check | Suggested size | Open/play acceptance |
|---|---|---|---|---:|---|
| DOCX | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | ZIP magic plus `[Content_Types].xml` and `word/document.xml` entries | 1–3 MiB | Word/Pages compatible; text, tables, images and layout intact; no repair warning |
| PNG | `.png` | `image/png` | `89 50 4E 47 0D 0A 1A 0A` | 2–5 MiB | Opens; dimensions and transparency preserved; no corruption |
| JPEG | `.jpg`, `.jpeg` | `image/jpeg` | SOI `FF D8` and EOI `FF D9` | 2–5 MiB | Opens; dimensions/EXIF bytes preserved; no corruption |
| MP3 | `.mp3` | `audio/mpeg` | ID3 header or valid MPEG frame sync | 5–10 MiB | Plays; duration, seeking, audio, metadata and full byte identity preserved |
| PDF | `.pdf` | `application/pdf` or empty browser MIME | `%PDF-` | ≤10 MiB | Opens without repair warning and bytes match |
| TXT | `.txt` | `text/plain` or empty browser MIME | Valid UTF-8 without NUL bytes | ≤10 MiB | Text and bytes match |
| HEIC/HEIF | `.heic`, `.heif` | controlled HEIC/HEIF aliases or empty browser MIME | ISO-BMFF `ftyp` plus HEIF-family brand | ≤10 MiB | Opens and bytes match |
| M4A | `.m4a` | controlled M4A aliases or empty browser MIME | ISO-BMFF `ftyp` | ≤10 MiB | Plays and bytes match |
| WAV | `.wav` | controlled WAV aliases or empty browser MIME | RIFF/WAVE | ≤10 MiB | Plays and bytes match |
| MP4 | `.mp4` | `video/mp4` or empty browser MIME | ISO-BMFF `ftyp` | ≤10 MiB | Plays and bytes match |
| MOV | `.mov` | controlled QuickTime aliases or empty browser MIME | ISO-BMFF `ftyp` | ≤10 MiB | Plays and bytes match |

All types additionally require a safe filename, readable non-empty bytes, and size no greater than 10,485,760 bytes. Extension, MIME, and content must agree; ambiguity fails closed.
