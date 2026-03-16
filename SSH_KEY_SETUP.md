# SSH Key Setup Guide for GitHub Authentication

## Overview

This guide walks through generating a secure **ed25519** SSH key pair for authenticating with GitHub, specifically for use with the [kushmanmb-org/bitcoin](https://github.com/kushmanmb-org/bitcoin) repository.

> ⚠️ **Security Notice**: Run all commands below on your **local machine only**. Your private key (`~/.ssh/id_ed25519`) must **never** be shared, committed to a repository, or transmitted over the network.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Generate the SSH Key Pair](#generate-the-ssh-key-pair)
3. [Add the Key to the SSH Agent](#add-the-key-to-the-ssh-agent)
4. [Secure Key Storage Best Practices](#secure-key-storage-best-practices)
5. [Upload the Public Key to GitHub](#upload-the-public-key-to-github)
6. [Test the Connection](#test-the-connection)
7. [References](#references)

---

## Prerequisites

- **OpenSSH 6.5+** (included by default on macOS 10.12+, Ubuntu 16.04+, and Windows 10 build 1809+)
- A terminal (macOS/Linux: Terminal; Windows: PowerShell or Git Bash)

Verify your OpenSSH version:

```bash
ssh -V
```

---

## Generate the SSH Key Pair

Run the following command on your **local machine** to create an ed25519 key pair. Replace the email address if needed.

```bash
ssh-keygen -t ed25519 -C "mattbrace92@gmail.com" -f ~/.ssh/id_ed25519_github
```

**Parameter breakdown:**

| Flag | Value | Purpose |
|------|-------|---------|
| `-t` | `ed25519` | Key type — ed25519 is the recommended algorithm (faster and more secure than RSA) |
| `-C` | `"mattbrace92@gmail.com"` | Comment to identify the key (typically your email) |
| `-f` | `~/.ssh/id_ed25519_github` | Output file path for the key pair |

When prompted:

```
Enter passphrase (empty for no passphrase):
```

> **Always set a strong passphrase.** This encrypts the private key at rest, providing a second layer of protection if the key file is ever stolen.

Two files will be created:

| File | Description |
|------|-------------|
| `~/.ssh/id_ed25519_github` | **Private key** — keep this secret, never share it |
| `~/.ssh/id_ed25519_github.pub` | **Public key** — safe to share; this is uploaded to GitHub |

---

## Add the Key to the SSH Agent

The SSH agent caches your decrypted key in memory so you only need to enter your passphrase once per session.

### macOS / Linux

```bash
# Start the agent (if not already running)
eval "$(ssh-agent -s)"

# Add the private key to the agent
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github   # macOS 12+
# or
ssh-add ~/.ssh/id_ed25519_github                         # Linux / macOS < 12
```

### Windows (PowerShell)

```powershell
# Start the agent service
Get-Service -Name ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent

# Add the private key
ssh-add $env:USERPROFILE\.ssh\id_ed25519_github
```

### Configure `~/.ssh/config` (recommended)

Add a Host entry so SSH automatically uses the correct key for GitHub:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  AddKeysToAgent yes
  UseKeychain yes   # macOS only — omit on Linux/Windows
```

---

## Secure Key Storage Best Practices

| Practice | Details |
|----------|---------|
| **Set a passphrase** | Always protect your private key with a strong, unique passphrase |
| **Restrict file permissions** | `chmod 600 ~/.ssh/id_ed25519_github` (owner read/write only) |
| **Never commit private keys** | Add `id_ed25519*` (without `.pub`) to `.gitignore` |
| **Use a hardware security key** | For highest security, generate the key on a FIDO2 hardware key (e.g., YubiKey) using `-t ed25519-sk` |
| **Rotate periodically** | Rotate SSH keys at least once per year (see the rotation schedule in [KEY_MANAGEMENT_GUIDE.md](KEY_MANAGEMENT_GUIDE.md)) |
| **Back up securely** | Store an encrypted backup in a password manager (e.g., 1Password, Bitwarden) — never in a cloud folder without encryption |
| **One key per device** | Generate a separate key for each machine; revoke keys for decommissioned devices |

---

## Upload the Public Key to GitHub

### Step 1 — Copy the Public Key

```bash
# macOS
pbcopy < ~/.ssh/id_ed25519_github.pub

# Linux (requires xclip or xsel)
xclip -selection clipboard < ~/.ssh/id_ed25519_github.pub
# or
cat ~/.ssh/id_ed25519_github.pub   # then copy the output manually

# Windows (PowerShell)
Get-Content $env:USERPROFILE\.ssh\id_ed25519_github.pub | Set-Clipboard
```

The public key will look like:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... mattbrace92@gmail.com
```

> ✅ This string is **safe to share publicly**. Only the private key is sensitive.

### Step 2 — Add the Key in GitHub Settings

1. Go to **[https://github.com/settings/keys](https://github.com/settings/keys)**  
   *(This is your personal account's SSH key settings.)*
2. Click **"New SSH key"**
3. Fill in the form:
   - **Title**: `mattbrace92 - <machine name>` (e.g., `mattbrace92 - MacBook Pro 2025`)
   - **Key type**: `Authentication Key`
   - **Key**: Paste the public key copied in Step 1
4. Click **"Add SSH key"**
5. Confirm with your GitHub password if prompted

### Step 3 — (Optional) Add as a Repository Deploy Key

To restrict a key to a single repository (read-only or read-write), add it as a **Deploy Key**:

1. Go to **[https://github.com/kushmanmb-org/bitcoin/settings/keys](https://github.com/kushmanmb-org/bitcoin/settings/keys)**
2. Click **"Add deploy key"**
3. Fill in:
   - **Title**: Descriptive name (e.g., `mattbrace92 deploy key`)
   - **Key**: Paste the public key
   - **Allow write access**: Check only if write access is needed
4. Click **"Add key"**

---

## Test the Connection

After uploading the key, verify the SSH connection from your local machine:

```bash
ssh -T git@github.com
```

Expected output:

```
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

If the test fails, run with verbose output to debug:

```bash
ssh -vT git@github.com
```

### Clone or update the repository using SSH

```bash
# Clone via SSH (instead of HTTPS)
git clone git@github.com:kushmanmb-org/bitcoin.git

# Update an existing clone's remote URL to use SSH
git remote set-url origin git@github.com:kushmanmb-org/bitcoin.git
```

---

## References

- [GitHub Docs — Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [GitHub Docs — Adding a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- [GitHub Docs — Testing your SSH connection](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)
- [GitHub Docs — Managing deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)
- [GitHub Docs — Working with SSH key passphrases](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/working-with-ssh-key-passphrases)
- [NIST SP 800-57 — Recommendation for Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [KEY_MANAGEMENT_GUIDE.md](KEY_MANAGEMENT_GUIDE.md) — Internal key rotation and management guide
- [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) — Broader security practices for this repository

---

**Last Updated**: 2026-03-07  
**Maintained by**: kushmanmb.eth (Kushman MB)
