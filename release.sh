#!/usr/bin/env bash
#
# Builds, signs, notarizes, and packages AgentLimit.app into a distributable
# DMG. Runs locally or in CI (GitHub Actions) — all credentials come from the
# environment.
#
# Required environment:
#   SIGNING_IDENTITY     "Developer ID Application: Your Name (TEAMID)"
#
# Notarization — either a stored notarytool profile…
#   NOTARY_PROFILE       name from `xcrun notarytool store-credentials`
# …or an Apple ID + app-specific password:
#   APPLE_ID             your Apple ID email
#   APPLE_TEAM_ID        your 10-char Developer Team ID
#   APPLE_APP_PASSWORD   app-specific password (appleid.apple.com)
#
set -euo pipefail

APP_NAME="AgentLimit"
APP_DIR="dist/${APP_NAME}.app"
DMG="dist/${APP_NAME}.dmg"
ZIP="dist/${APP_NAME}-notarize.zip"

cd "$(dirname "$0")"

: "${SIGNING_IDENTITY:?Set SIGNING_IDENTITY to your 'Developer ID Application: …' identity}"

# 1. Build the unsigned .app.
./build.sh

# 2. Code-sign with a hardened runtime (required for notarization). Sign nested
#    bundles (the SwiftPM resource bundle) before the outer app.
echo "Signing ${APP_DIR}…"
while IFS= read -r -d '' bundle; do
    codesign --force --timestamp --options runtime --sign "${SIGNING_IDENTITY}" "$bundle"
done < <(find "${APP_DIR}/Contents/Resources" -maxdepth 1 -name "*.bundle" -print0)

codesign --force --timestamp --options runtime --sign "${SIGNING_IDENTITY}" "${APP_DIR}/Contents/MacOS/${APP_NAME}"
codesign --force --timestamp --options runtime --sign "${SIGNING_IDENTITY}" "${APP_DIR}"
codesign --verify --deep --strict --verbose=2 "${APP_DIR}"

# 3. Notarize. Apple notarizes a zip/dmg; we submit a zip and wait for the result.
echo "Submitting for notarization (this can take a few minutes)…"
/usr/bin/ditto -c -k --keepParent "${APP_DIR}" "${ZIP}"
if [[ -n "${NOTARY_PROFILE:-}" ]]; then
    xcrun notarytool submit "${ZIP}" --keychain-profile "${NOTARY_PROFILE}" --wait
else
    : "${APPLE_ID:?Set APPLE_ID or NOTARY_PROFILE}"
    : "${APPLE_TEAM_ID:?Set APPLE_TEAM_ID or NOTARY_PROFILE}"
    : "${APPLE_APP_PASSWORD:?Set APPLE_APP_PASSWORD or NOTARY_PROFILE}"
    xcrun notarytool submit "${ZIP}" \
        --apple-id "${APPLE_ID}" \
        --team-id "${APPLE_TEAM_ID}" \
        --password "${APPLE_APP_PASSWORD}" \
        --wait
fi
rm -f "${ZIP}"

# 4. Staple the ticket onto the .app so Gatekeeper passes it offline.
xcrun stapler staple "${APP_DIR}"

# 5. Package a DMG (the app + an /Applications drop target) from the stapled app.
echo "Building ${DMG}…"
rm -f "${DMG}"
STAGING="dist/dmg-staging"
rm -rf "${STAGING}"; mkdir -p "${STAGING}"
cp -R "${APP_DIR}" "${STAGING}/"
ln -s /Applications "${STAGING}/Applications"
hdiutil create -volname "${APP_NAME}" -srcfolder "${STAGING}" -ov -format UDZO "${DMG}"
rm -rf "${STAGING}"

echo
echo "Built ${DMG}"
echo "Verify with: spctl -a -t open --context context:primary-signature -v \"${DMG}\""
