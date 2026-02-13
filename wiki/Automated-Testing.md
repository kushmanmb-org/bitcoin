# Automated Testing

Comprehensive guide to automated testing in Bitcoin Core.

## 🧪 Testing Overview

Bitcoin Core has extensive automated testing at multiple levels:

1. **Unit Tests** - Test individual components
2. **Functional Tests** - Test complete system behavior
3. **Fuzz Tests** - Security-focused random testing
4. **Integration Tests** - Test component interactions

## 🔧 Unit Tests

### Location

Unit tests are in `src/test/` directory.

### Running Unit Tests

```bash
# Build with tests
cmake -B build -DBUILD_TESTS=ON
cmake --build build

# Run all unit tests
cd build
ctest -j$(nproc)

# Run specific test suite
./src/test/test_bitcoin --log_level=all --run_test=validation_tests
```

### Writing Unit Tests

```cpp
#include <boost/test/unit_test.hpp>

BOOST_AUTO_TEST_SUITE(my_test_suite)

BOOST_AUTO_TEST_CASE(my_test)
{
    // Arrange
    int expected = 42;
    
    // Act
    int result = MyFunction();
    
    // Assert
    BOOST_CHECK_EQUAL(result, expected);
}

BOOST_AUTO_TEST_SUITE_END()
```

## 🐍 Functional Tests

### Location

Functional tests are in `test/functional/` directory.

### Running Functional Tests

```bash
# Run all functional tests
./build/test/functional/test_runner.py

# Run specific test
./build/test/functional/wallet_basic.py

# Run with more verbose output
./build/test/functional/test_runner.py --verbose

# Run in parallel
./build/test/functional/test_runner.py -j4
```

### Writing Functional Tests

```python
from test_framework.test_framework import BitcoinTestFramework
from test_framework.util import assert_equal

class MyTest(BitcoinTestFramework):
    def set_test_params(self):
        self.num_nodes = 2
        self.setup_clean_chain = True
    
    def run_test(self):
        # Test logic here
        node = self.nodes[0]
        
        # Generate blocks
        node.generate(101)
        
        # Test assertions
        assert_equal(node.getblockcount(), 101)
        
        self.log.info("Test passed!")

if __name__ == '__main__':
    MyTest().main()
```

## 🎯 Fuzz Testing

### Overview

Fuzz testing uses random inputs to find bugs and security vulnerabilities.

### Running Fuzz Tests

```bash
# Build fuzz targets
cmake -B build -DBUILD_FOR_FUZZING=ON
cmake --build build

# Run fuzz test
./build/src/test/fuzz/process_message

# Run with corpus
./test/fuzz/test_runner.py
```

### Fuzz Test Targets

Located in `src/test/fuzz/`:
- Network message processing
- Script parsing
- Transaction validation
- Block validation
- RPC handling

## 🔄 Integration Tests

### Test Categories

1. **Consensus Tests** - Verify consensus rules
2. **P2P Tests** - Test network behavior
3. **Wallet Tests** - Test wallet functionality
4. **RPC Tests** - Test RPC interface

### Running Specific Categories

```bash
# Wallet tests
./build/test/functional/test_runner.py --extended wallet_*

# P2P tests
./build/test/functional/test_runner.py p2p_*

# RPC tests
./build/test/functional/test_runner.py rpc_*
```

## 📊 Test Coverage

### Measuring Coverage

```bash
# Build with coverage
cmake -B build -DENABLE_COVERAGE=ON
cmake --build build

# Run tests
cd build
ctest

# Generate coverage report
make coverage
```

### Coverage Goals

- High coverage for critical components
- Focus on consensus code
- Regression test for every bug fix

## ⚡ Performance Testing

### Benchmarks

```bash
# Build benchmarks
cmake -B build -DBUILD_BENCH=ON
cmake --build build

# Run benchmarks
./build/src/bench/bench_bitcoin
```

### Performance Tests

- Transaction validation speed
- Block validation speed
- Database performance
- Network throughput

## 🔍 Debugging Tests

### Verbose Output

```bash
# Unit tests with logging
./build/src/test/test_bitcoin --log_level=all

# Functional tests with debug
./build/test/functional/wallet_basic.py --loglevel=DEBUG
```

### Debugging Failures

```bash
# Keep test data after failure
./build/test/functional/wallet_basic.py --nocleanup

# Run with pdb on failure
./build/test/functional/wallet_basic.py --pdbonfailure
```

## 🔒 Security Testing

### Static Analysis

```bash
# Run clang-tidy
cmake -B build -DENABLE_CLANG_TIDY=ON
cmake --build build
```

### Sanitizers

Build with sanitizers for runtime checks:

```bash
# AddressSanitizer
cmake -B build -DENABLE_ASAN=ON

# ThreadSanitizer
cmake -B build -DENABLE_TSAN=ON

# UndefinedBehaviorSanitizer
cmake -B build -DENABLE_UBSAN=ON
```

## 🚀 Continuous Integration

Tests run automatically on:
- Every pull request
- Every commit to main branches
- Scheduled daily runs

See [CI/CD Pipeline](CI-CD-Pipeline.md) for more information.

## ✅ Best Practices

### Writing Tests

1. **Test one thing** - Each test should verify one behavior
2. **Be descriptive** - Use clear test names
3. **Be independent** - Tests shouldn't depend on each other
4. **Be fast** - Optimize for quick execution
5. **Be deterministic** - Tests should always produce same result

### Test Maintenance

1. **Keep tests updated** with code changes
2. **Remove obsolete tests** when functionality changes
3. **Add regression tests** for every bug fix
4. **Document complex tests** with comments
5. **Review test failures** thoroughly

## 📚 Resources

- [Unit Test Documentation](../src/test/README.md)
- [Functional Test Framework](../test/functional/README.md)
- [Developer Notes](../doc/developer-notes.md)
- [CI Configuration](../.github/workflows/ci.yml)

## 🆘 Getting Help

- Review existing tests for examples
- Check test framework documentation
- Ask in developer discussions
- Report test infrastructure issues

---

**Remember**: Good tests are as important as good code. Always add tests for new functionality and bug fixes.
