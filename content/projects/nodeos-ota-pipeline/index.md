---
title: "NodeOS OTA Firmware Pipeline"
slug: "nodeos-ota-pipeline"
summary: "CI/CD pipeline that builds ESP32 firmware, makes binary patches and chunks them for LoRa mesh transmission."
status: "in-progress"
status_note: "The pipeline and gateway simulation are fully working (v1.2.6). What's missing is the final delivery program (currently replaced by a chunking simulator). Hardware integration comes after."
approach: "ai-assisted"
approach_note: "AI wrote the initial Python scripts and GitHub Actions boilerplate; I managed the architecture, C++ structuring, and Git workflow."
context: "school"
team_size: 1
role: ""
started: "2026-08"
ended: ""
tags: ["embedded", "tooling"]
stack: ["C++", "Python", "PlatformIO", "GitHub Actions", "ESP32", "DevOps"]
# All four .png files in this folder are stand-ins: replace them with real screenshots.
# While this is true, the site shows placeholders instead of the stand-in pictures.
stand_in_images: true
cover: "cover.png"
cover_alt: "A terminal output showing a binary patch being successfully fragmented into 64-byte LoRa frames."
links:
  - label: "GitHub"
    url: "https://github.com/HerrDextro/nodeos-firmware"
---

## What it is

This is a DevOps pipeline for remote Internet of Things (IoT) Over-The-Air (OTA) firmware updates. It is built for a dual-bank ESP32 architecture called NodeOS. NodeOS doesn't really exist yet, but I'm working on it. The system automatically tests C++ logic locally, compiles the firmware, calculates a binary differential patch between versions, and simulates a gateway (`mesh3m_gateway.py`) that chunks the patch into tiny payloads for an 868 MHz LoRa network.

## Why I built it

I built this to meet the M324 school evaluation criteria (aiming for a 6.0 grade) while setting up the foundation for my upcoming "Mesh3M" node manager platform. Sending full 267 KB `.bin` files over a slow LoRa mesh would kill the network for hours. I needed a way to drastically shrink the payload before transmission.

## How it works

The system is split into local development and an automated GitHub Actions pipeline.

Locally, PlatformIO handles the environment. Standard C++ business logic runs natively on my PC using the Unity testing framework. ESP32-specific code compiles separately for the Xtensa processor architecture.

![TODO: replace placeholder. PlatformIO test runner output showing a sub-second [PASSED] native unit test.](native-tests.png)

On a Git tag push, the GitHub Actions workflow triggers. An Ubuntu runner installs PlatformIO, runs the native unit tests, and compiles the new `firmware.bin`. A Python script (`create_patch.py`) downloads the previous release binary and uses `bsdiff4` to generate a diff. Finally, the CD step runs `mesh3m_gateway.py`, which authenticates against the GitHub REST API, pulls the patch, and slices it into 64-byte frames ready for radio broadcast.

![TODO: replace placeholder. A GitHub Actions run triggered by a tag push: native tests, firmware build, patch generation and the gateway step.](actions-run.png)

## What went wrong

- **Native C++ compilation failed on PC:** Initially, the local test runner tried to compile `main.cpp`, which contained `<Arduino.h>` and ESP32 hardware dependencies. My PC compiler couldn't read this. I fixed it by extracting pure logic into `calculator.h/cpp` and updating `platformio.ini` with `build_src_filter = +<*> -<main.cpp>` to ignore the hardware layer during PC tests.
- **Git didn't track a file rename:** I renamed `mesh3m-gateway.py` to `mesh3m_gateway.py`, but the CI pipeline crashed with a "No such file" error. Git kept the old filename cached. I had to force an update using `git rm --cached` and stage the new file manually.
- **404 errors downloading release artifacts:** The CD script failed to fetch the patch from GitHub Releases. The issue was twofold: GitHub's CDN had a slight propagation delay causing race conditions, and my repository was private, meaning direct URLs were blocked. I rewrote the Python script to use the GitHub REST API, explicitly passing the runner's `GITHUB_TOKEN` and requesting an `application/octet-stream` via HTTP headers.

## The parts that had to work

- **Hardware isolation in C++:** Separating logic (header files and pure C++ files) from hardware calls (`main.cpp`) to allow sub-second local unit testing without flashing an actual ESP32.
- **Binary diffing:** Using `bsdiff4` to compare compiled binaries. This shrinks a ~267 KB firmware update down to a ~983 byte patch, a 99.6% bandwidth reduction critical for LoRa constraints.
- **API content negotiation:** Using the `Accept: application/vnd.github+json` header to get release metadata, and swapping to `Accept: application/octet-stream` to actually stream the raw binary file from a private GitHub repository.
- **Git history merges:** Using `--allow-unrelated-histories` to successfully merge a remote repo containing a default README with my local PlatformIO codebase.

## Where AI came in

I designed the dual-bank NodeOS concept and defined the strict LoRa bandwidth requirements. Based on criteria I set, AI generated the boilerplate for the GitHub Actions YAML, wrote the Python `bsdiff4` implementation, and helped debug the GitHub API authentication logic. I executed the Git workflows, structured the C++ project separation, and verified the final byte-chunking outputs on my machine.

## Current state

- The CI/CD pipeline is fully functional on GitHub (v1.2.6).
- Native PlatformIO unit testing executes cleanly.
- The Python gateway successfully downloads 155 KB patches from a private repo and fragments them into 2436 discrete 64-byte LoRa frames.
- **TODO: Mesh3M architecture decision.** I need to decide if nodes will pull updates on demand upon startup, or if the server will push them via CD to test nodes.
- **TODO:** Implement GitHub Issues for requirements traceability.

![TODO: replace placeholder. The gateway's terminal output: the patch downloaded from the private repo and split into 64-byte LoRa frames.](gateway-frames.png)

## What carried over

- How to structure embedded C++ projects into distinct logic and hardware modules for fast CI testing.
- Fetching secure binaries from private GitHub repositories programmatically using REST APIs and tokens.
