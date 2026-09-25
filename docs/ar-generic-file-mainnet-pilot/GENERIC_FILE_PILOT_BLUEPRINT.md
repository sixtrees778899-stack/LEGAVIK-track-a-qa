# Generic Single-File Mainnet Pilot Blueprint

## Purpose and isolation

This independent harness validates one customer-selected file from the frozen single-file whitelist at a time: PDF, DOCX, TXT, PNG, JPG/JPEG, HEIC/HEIF, MP3, M4A, WAV, MP4, or MOV. It does not modify or import UI state from Recovery Map V2, the PDF Story A harness, or the MP4 pilot. Each run has one source file, one binary Archive, one Recovery Kit, one quote, at most one authorized broadcast, one Evidence file, and one independent recovery.

## Customer flow

1. Select one allowlisted file, set and confirm a fresh recovery password, and accept the safety statement.
2. Validate extension, browser MIME, size, and format signature/container; hash and encrypt locally with AES-256-GCM.
3. Download the Recovery Kit and optional local Archive copy; show exact Archive overhead.
4. Read wallet public address/balance and a live Arweave quote, then stop for per-file authorization.
5. After later authorization, the same page must upload the in-memory Archive once and generate Evidence automatically. It must not ask the customer to reselect the Archive.
6. A new recovery page accepts only Evidence, Recovery Kit, and password, downloads by TxID with `no-store`, verifies the Archive, decrypts locally, and delivers the original file with a repeat-download control.

## Architecture

`File validation -> Generic artifact builder -> binary Archive -> Recovery Kit -> quote gate -> later broadcast gate -> Evidence -> independent recovery -> byte-identical delivery`

Stable public crypto and Recovery Kit builders are called without modification. The generic Archive has its own magic/version and is not a Recovery Map Snapshot or frozen Archive format.

## Current release boundary

This release exposes local encryption, downloads, and quote-only preparation for DOCX first. Signing, upload, and broadcasting are absent from the released page until a separate one-transaction authorization is received.
