#!/usr/bin/env bash
set -e

BINARY_PATH="target/release/Chiri"

echo "Fixing library dependencies for signed binary..."

# Check if the binary exists
if [ ! -f "$BINARY_PATH" ]; then
    echo "Binary not found at $BINARY_PATH, skipping library fix"
    exit 0
fi

# Check if libiconv needs fixing
if otool -L "$BINARY_PATH" | grep -q "/nix/store.*libiconv"; then
    echo "Found Nix libiconv dependency, replacing with system library..."

    # Get the current Nix path
    NIX_ICONV=$(otool -L "$BINARY_PATH" | grep "/nix/store.*libiconv" | awk '{print $1}')

    # Replace with system libiconv
    install_name_tool -change "$NIX_ICONV" /usr/lib/libiconv.dylib "$BINARY_PATH"

    echo "Successfully replaced Nix libiconv with system library"
    echo "Updated library path:"
    otool -L "$BINARY_PATH" | grep iconv
else
    echo "No Nix libiconv dependency found, no changes needed"
fi
