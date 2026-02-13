# Development Environment

Guide for setting up your development environment for Bitcoin Core.

## 🛠️ Prerequisites

Before starting, ensure you have:

- Operating system: Linux, macOS, Windows, or BSD
- Sufficient disk space (at least 10GB for build artifacts)
- RAM: 4GB minimum, 8GB+ recommended
- Network connection for downloading dependencies

## 📦 Installing Dependencies

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install build-essential cmake ninja-build pkg-config \
  libboost-dev libboost-system-dev libboost-filesystem-dev \
  libboost-thread-dev libevent-dev libzmq3-dev libsqlite3-dev \
  qt6-base-dev qt6-tools-dev libqrencode-dev
```

### macOS

```bash
brew install cmake ninja boost libevent zeromq qt@6 qrencode
```

### Windows

See [Windows build guide](../doc/build-windows.md) for detailed instructions.

## 🔧 IDE Setup

### Visual Studio Code

Recommended extensions:
- C/C++ (Microsoft)
- CMake Tools
- Python
- GitLens

### CLion

- Import the project as a CMake project
- Configure the CMake profile
- Set up the run configurations

### Other IDEs

Any IDE with CMake support will work. See [developer notes](../doc/developer-notes.md) for tips.

## 🏗️ Building

See the [Setup Guide](Setup-Guide.md) for detailed build instructions.

Quick start:

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j$(nproc)
```

## 🧪 Testing Setup

```bash
cd build
ctest -j$(nproc)
```

For functional tests:

```bash
./test/functional/test_runner.py
```

## 🔍 Debugging

### GDB (Linux)

```bash
gdb ./build/src/bitcoind
```

### LLDB (macOS)

```bash
lldb ./build/src/bitcoind
```

### Visual Studio Debugger (Windows)

Use the Visual Studio IDE for debugging on Windows.

## 📚 Next Steps

- Review [Developer Notes](../doc/developer-notes.md)
- Understand the [CI/CD Pipeline](CI-CD-Pipeline.md)
- Follow [Security Practices](Security-Practices.md)

---

For more detailed information, see the [build documentation](../doc/) directory.
