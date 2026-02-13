# CI/CD Pipeline

Documentation for the Continuous Integration and Continuous Deployment pipeline in the Bitcoin Core project.

## 🔄 Overview

The project uses GitHub Actions for CI/CD automation, running comprehensive tests and checks on every commit and pull request.

## 🏗️ Main CI Workflow

The primary CI workflow (`.github/workflows/ci.yml`) handles:

### Platform Testing

- **Linux**: Multiple configurations including ASan, TSan, MSan
- **macOS**: Native builds for Intel and ARM
- **Windows**: MSVC and cross-compilation builds
- **FreeBSD/NetBSD/OpenBSD**: Cross-platform compatibility

### Build Variants

1. **Standard builds**: Full feature set
2. **No-wallet builds**: Without wallet functionality
3. **Fuzz testing**: Security-focused testing
4. **Sanitizer builds**: Memory and thread safety checks

### Test Suites

- **Unit tests**: C++ test suite
- **Functional tests**: Python-based integration tests
- **Fuzz tests**: Automated security testing
- **Linting**: Code style and quality checks

## 🔍 Code Quality Checks

### Linting

The lint job checks:
- Code style (clang-format)
- Python style (flake8, mypy)
- Shell scripts (shellcheck)
- Commit messages
- Documentation

### Static Analysis

- **clang-tidy**: C++ static analysis
- **IWYU**: Include-what-you-use
- **cppcheck**: Additional C++ checks

## 🔐 Security Scanning

### Automated Security

- **Dependabot**: Dependency vulnerability scanning
- **CodeQL**: Code security analysis
- **Secret scanning**: Detects committed secrets

### Sanitizers

- **AddressSanitizer (ASan)**: Memory errors
- **ThreadSanitizer (TSan)**: Race conditions
- **MemorySanitizer (MSan)**: Uninitialized memory
- **UndefinedBehaviorSanitizer (UBSan)**: Undefined behavior

## ⚡ Performance

### Caching

The CI uses caching for:
- **ccache**: Compiler cache
- **depends**: Build dependencies
- **vcpkg**: Package manager cache

### Optimization

- Parallel builds with `-j`
- Incremental builds where possible
- Concurrent test execution

## 🚀 Workflow Triggers

### Automatic Triggers

```yaml
on:
  push:
    branches: ['**']
  pull_request:
```

### Manual Triggers

Some workflows support manual dispatch for on-demand execution.

## 📊 Monitoring Results

### GitHub Actions UI

1. Go to the "Actions" tab
2. Select a workflow
3. View run details and logs

### Status Checks

All required checks must pass before merging:
- ✅ Build successful
- ✅ Tests passing
- ✅ Linting clean
- ✅ Security checks passed

## 🛠️ Local Testing

### Running Tests Locally

```bash
# Build
cmake -B build
cmake --build build -j$(nproc)

# Unit tests
cd build
ctest -j$(nproc)

# Functional tests
cd ..
./build/test/functional/test_runner.py
```

### Running Linters

```bash
# All linters
./test/lint/lint-all.sh

# Specific checks
./test/lint/lint-python.py
./test/lint/lint-shell.py
```

## 🔄 CI/CD Best Practices

### For Contributors

1. **Run tests locally** before pushing
2. **Check lint** to avoid CI failures
3. **Keep commits clean** and focused
4. **Monitor CI results** after pushing
5. **Address failures promptly**

### For Maintainers

1. **Review CI logs** for failures
2. **Update workflows** as needed
3. **Monitor resource usage**
4. **Keep dependencies updated**
5. **Document changes**

## 📝 Adding New Tests

### Unit Tests

Add tests in `src/test/`:

```cpp
BOOST_AUTO_TEST_CASE(my_test) {
    // Test code
    BOOST_CHECK_EQUAL(result, expected);
}
```

### Functional Tests

Add tests in `test/functional/`:

```python
class MyTest(BitcoinTestFramework):
    def run_test(self):
        # Test code
        assert_equal(result, expected)
```

## 🐛 Debugging CI Failures

### Common Issues

**Build Failures**:
- Check compilation errors in logs
- Verify dependencies are correct
- Ensure code compiles locally

**Test Failures**:
- Review test output
- Run failing test locally
- Check for timing issues

**Lint Failures**:
- Run linters locally
- Fix formatting issues
- Update documentation

### Getting Help

- Check existing issues
- Review workflow logs
- Ask in discussions
- Consult documentation

## 🔗 Related Documentation

- [Workflow Management](Workflow-Management.md)
- [Automated Testing](Automated-Testing.md)
- [Developer Notes](../doc/developer-notes.md)

---

**Note**: The CI pipeline is continuously evolving. Check workflow files for the most up-to-date configuration.
