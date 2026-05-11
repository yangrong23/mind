#!/usr/bin/env bash
# One-shot: wire GitHub SSH to a custom key filename + show pubkey + test.
set -euo pipefail

KEY="${GITHUB_SSH_KEY:-$HOME/.ssh/id_ed25519_github}"
CONFIG="$HOME/.ssh/config"
MARKER="# github.com — id_ed25519_github (added by setup-github-ssh.sh)"

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [[ ! -f "$KEY" ]]; then
  echo "Missing private key: $KEY"
  echo "Generate first, e.g.:"
  echo "  ssh-keygen -t ed25519 -C \"your@email\" -f \"$KEY\""
  exit 1
fi

chmod 600 "$KEY" 2>/dev/null || true
[[ -f "${KEY}.pub" ]] && chmod 644 "${KEY}.pub"

touch "$CONFIG"
chmod 600 "$CONFIG"

if ! grep -qF "$MARKER" "$CONFIG" 2>/dev/null; then
  {
    echo ""
    echo "$MARKER"
    echo "Host github.com"
    echo "  HostName github.com"
    echo "  User git"
    echo "  IdentityFile $KEY"
    echo "  IdentitiesOnly yes"
  } >> "$CONFIG"
  echo "Appended GitHub block to $CONFIG"
else
  echo "GitHub block already present in $CONFIG (marker found). Skip append."
fi

# Load key (will prompt for passphrase if you set one)
if [[ -n "${SSH_AUTH_SOCK:-}" ]] || command -v ssh-agent >/dev/null 2>&1; then
  eval "$(ssh-agent -s)" >/dev/null
  ssh-add --apple-use-keychain "$KEY" 2>/dev/null || ssh-add "$KEY" || true
fi

echo ""
echo "=== Add this public key on GitHub (Settings → SSH and GPG keys) ==="
cat "${KEY}.pub"
echo "================================================================"
echo ""
echo "Testing: ssh -T git@github.com"
ssh -T git@github.com || true
