# 🛡️ Move Security Auditor

A comprehensive static analysis tool for Move smart contracts that identifies security vulnerabilities, access control issues, and potential attack vectors before deployment.

## ✨ Features

- **Static Code Analysis**: Automated vulnerability detection using pattern matching and semantic analysis
- **Multi-Category Security Checks**: Access control, integer operations, economic vulnerabilities, and more
- **Smart Contract Compilation**: Integrates with Sui Move compiler for build verification
- **Detailed Reporting**: Generate markdown or JSON reports with code snippets and remediation guidance
- **Configurable Severity Levels**: Filter findings by severity (Critical, High, Medium, Low, Info)
- **Project-Wide Auditing**: Scan entire Move projects or individual files

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- TypeScript
- Sui CLI (for Move compilation)

### Install Dependencies

```bash
npm install
npm install -g typescript
```

### Build the Project

```bash
npm run build
# or
tsc
```

## 📋 Usage

### Command Line Interface

```bash
# Audit an entire Move project
node dist/index.js /path/to/move/project

# Audit a single Move file
node dist/index.js /path/to/contract.move

# Generate report with specific output file
node dist/index.js /path/to/project -o security-report.md

# Output as JSON
node dist/index.js /path/to/project --json -o report.json

# Filter by severity level
node dist/index.js /path/to/project -s HIGH

# Check specific categories only
node dist/index.js /path/to/project -c "Access Control,Integer Operations"

# Quiet mode (minimal console output)
node dist/index.js /path/to/project --quiet
```

### Programmatic Usage

```typescript
import { MoveSecurityAuditor, Severity } from './move-auditor';

const auditor = new MoveSecurityAuditor({
    severityThreshold: Severity.MEDIUM,
    enabledCategories: ['Access Control', 'Integer Operations']
});

// Audit a directory
const result = await auditor.auditDirectory('/path/to/move/project');

// Audit a single file
const findings = await auditor.auditFile('/path/to/contract.move');

// Generate report
const report = auditor.generateReport(result, 'security-report.md');
```

## 🔍 Security Checks

### Access Control Vulnerabilities
- **Missing Access Control**: Public functions without proper capability checks
- **Unprotected Admin Functions**: Administrative functions lacking owner verification
- **Capability Pattern Violations**: Improper use of Move's capability-based security

### Integer Operation Safety
- **Unchecked Arithmetic**: Addition, subtraction, multiplication without overflow protection
- **Division by Zero**: Unprotected division operations
- **Bounds Checking**: Missing input validation for numeric parameters

### Economic Security
- **Price Manipulation**: Direct price calculations vulnerable to flash loan attacks
- **Flash Loan Safety**: Improper flash loan implementations
- **Reserve Calculations**: Unsafe token reserve manipulations

### Smart Contract Best Practices
- **Magic Numbers**: Hard-coded values that should be constants
- **Missing Error Codes**: Assert statements without descriptive error codes
- **State Consistency**: Violations of Checks-Effects-Interactions pattern

### Advanced Patterns
- **Reentrancy Protection**: Missing guards for external calls
- **Governance Security**: Timelock mechanisms for critical operations
- **Input Validation**: Comprehensive parameter checking

## 📊 Report Format

### Markdown Report Structure

```markdown
# 🛡️ Move Smart Contract Security Audit Report

**Generated:** 2024-01-15T10:30:00.000Z
**Files Audited:** 5
**Total Findings:** 12

## 📊 Executive Summary

| Severity | Count | Priority |
|----------|-------|----------|
| 🔴 CRITICAL | 2 | Immediate |
| 🟠 HIGH | 3 | High |
| 🟡 MEDIUM | 5 | Medium |
| 🔵 LOW | 2 | Low |

## 🔍 Detailed Findings

### 1. 🔴 Potential Missing Access Control
**Severity:** HIGH
**Category:** Access Control
**File:** /path/to/contract.move
**Line:** 45

**Description:** Public function may lack proper access control mechanisms: transfer_tokens

**Code:**
```move
  43: }
  44: 
→ 45: public fun transfer_tokens(from: address, to: address, amount: u64) {
  46:     let balance = balance_of(from);
  47:     assert!(balance >= amount, 1001);
```

**Recommendation:** Add capability parameters, owner checks, or other access control mechanisms
```

### JSON Report Structure

```json
{
  "findings": [
    {
      "severity": "HIGH",
      "category": "Access Control",
      "title": "Potential Missing Access Control",
      "description": "Public function may lack proper access control mechanisms: transfer_tokens",
      "lineNumber": 45,
      "codeSnippet": "→  45: public fun transfer_tokens(from: address, to: address, amount: u64) {",
      "recommendation": "Add capability parameters, owner checks, or other access control mechanisms",
      "fileName": "/path/to/contract.move",
      "confidence": "MEDIUM"
    }
  ],
  "summary": {
    "totalFindings": 12,
    "severityCounts": {
      "CRITICAL": 2,
      "HIGH": 3,
      "MEDIUM": 5,
      "LOW": 2,
      "INFO": 0
    },
    "filesAudited": 5,
    "criticalIssues": 5
  }
}
```

## ⚙️ Configuration

### Audit Configuration Options

```typescript
interface AuditConfig {
    enabledCategories: string[];      // Categories to check
    severityThreshold: Severity;      // Minimum severity to report
    customPatterns: VulnerabilityPattern[];  // Custom vulnerability patterns
    excludePatterns: string[];        // Patterns to exclude from analysis
}
```

### Available Categories
- `Access Control`
- `Integer Operations`
- `Economic Vulnerability`
- `Input Validation`
- `Dangerous Patterns`
- `Best Practices`
- `Governance`
- `State Consistency`
- `Reentrancy`

### Severity Levels
- `CRITICAL`: Immediate security risks requiring urgent fixes
- `HIGH`: Serious vulnerabilities that should be addressed before deployment
- `MEDIUM`: Important issues that may lead to security problems
- `LOW`: Minor issues and code quality improvements
- `INFO`: Informational findings and suggestions

## 🛠️ Development

### Project Structure

```
move-auditor/
├── src/
│   └── index.ts              # Main auditor implementation
├── test/
│   └── sources/
│       └── test.move         # Test Move contracts
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Adding Custom Vulnerability Patterns

```typescript
const customPattern: VulnerabilityPattern = {
    pattern: /your_regex_pattern/,
    severity: Severity.HIGH,
    category: 'Custom Category',
    title: 'Custom Vulnerability',
    description: 'Description of the vulnerability',
    recommendation: 'How to fix it',
    checkFunction: (line, lineIndex, allLines) => {
        // Custom validation logic
        return true; // Return true if vulnerability exists
    }
};

const auditor = new MoveSecurityAuditor({
    customPatterns: [customPattern]
});
```

### Running Tests

```bash
# Test with sample Move file
node dist/index.js test/sources/test.move

# Test with project directory
node dist/index.js /path/to/move/project
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-check`
3. Add your vulnerability patterns or improvements
4. Test thoroughly with various Move contracts
5. Submit a pull request

### Guidelines for New Vulnerability Patterns

- Provide clear, actionable recommendations
- Include test cases demonstrating the vulnerability
- Use appropriate severity levels
- Add comprehensive documentation
- Consider false positive rates

## ⚠️ Disclaimer

This tool is designed to assist in identifying potential security vulnerabilities in Move smart contracts. It should not be considered a substitute for professional security audits or formal verification. Always conduct thorough testing and consider professional security reviews before deploying smart contracts to production.

## 🔗 Resources


---