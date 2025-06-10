import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { execSync } from 'child_process';

enum Severity {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    INFO = 'INFO'
}

interface VulnerabilityPattern {
    pattern: RegExp;
    severity: Severity;
    category: string;
    title: string;
    description: string;
    recommendation: string;
    checkFunction?: (line: string, lineIndex: number, allLines: string[]) => boolean;
}

interface SecurityFinding {
    severity: Severity;
    category: string;
    title: string;
    description: string;
    lineNumber: number;
    codeSnippet: string;
    recommendation: string;
    fileName: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AuditConfig {
    enabledCategories: string[];
    severityThreshold: Severity;
    customPatterns: VulnerabilityPattern[];
    excludePatterns: string[];
}

interface AuditResult {
    findings: SecurityFinding[];
    summary: {
        totalFindings: number;
        severityCounts: Record<Severity, number>;
        filesAudited: number;
        criticalIssues: number;
    };
}

class MoveSecurityAuditor {
    private findings: SecurityFinding[] = [];
    private currentFile: string = '';
    private lines: string[] = [];
    private config: AuditConfig;

    constructor(config?: Partial<AuditConfig>) {
        this.config = {
            enabledCategories: ['all'],
            severityThreshold: Severity.INFO,
            customPatterns: [],
            excludePatterns: [],
            ...config
        };
    }

    public async performStaticAnalysis(contractPath: string): Promise<void> {
        try {
            console.log('🔧 Performing static analysis...');

            if (fs.statSync(contractPath).isDirectory()) {
                if (fs.existsSync(path.join(contractPath, 'Move.toml'))) {
                    try {
                        const output = execSync(`sui move build`, {
                            cwd: contractPath,
                            encoding: 'utf-8'
                        });
                        console.log('✅ Contract compilation successful');
                        console.log(output);
                    } catch (error: any) {
                        console.log('⚠️  Compilation warnings/errors detected');
                        if (error.stderr) {
                            console.error('Error details:');
                            console.error(error.stderr.toString());
                        } else if (error.output) {
                            console.error('Error details:');
                            error.output.forEach((buffer: Buffer) => {
                                if (buffer) console.error(buffer.toString());
                            });
                        } else {
                            console.error('Unknown error:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('⚠️  Static analysis encountered issues:');
            console.error(error);
        }
    }

    private readonly vulnerabilityPatterns: VulnerabilityPattern[] = [
        {
            pattern: /public\s+fun\s+(\w+).*\{/,
            severity: Severity.HIGH,
            category: 'Access Control',
            title: 'Potential Missing Access Control',
            description: 'Public function may lack proper access control mechanisms',
            recommendation: 'Add capability parameters, owner checks, or other access control mechanisms',
            checkFunction: this.checkAccessControl.bind(this)
        },

        {
            pattern: /\w+\s*=\s*\w+\s*\+\s*\w+(?!\s*;.*assert!)/,
            severity: Severity.MEDIUM,
            category: 'Integer Operations',
            title: 'Unchecked Addition',
            description: 'Addition operation without overflow protection',
            recommendation: 'Add overflow checks with assert! statements'
        },
        {
            pattern: /\w+\s*=\s*\w+\s*-\s*\w+(?!\s*;.*assert!)/,
            severity: Severity.MEDIUM,
            category: 'Integer Operations',
            title: 'Unchecked Subtraction',
            description: 'Subtraction operation without underflow protection',
            recommendation: 'Add underflow checks with assert! statements'
        },
        {
            pattern: /\w+\s*=\s*\w+\s*\*\s*\w+(?!\s*;.*assert!)/,
            severity: Severity.MEDIUM,
            category: 'Integer Operations',
            title: 'Unchecked Multiplication',
            description: 'Multiplication operation without overflow protection',
            recommendation: 'Add overflow checks with assert! statements'
        },
        {
            pattern: /\w+\s*\/\s*\w+(?!\s*;.*assert!)/,
            severity: Severity.HIGH,
            category: 'Integer Operations',
            title: 'Unchecked Division',
            description: 'Division operation without zero-check protection',
            recommendation: 'Add division by zero checks with assert! statements'
        },

        {
            pattern: /(reserve_\w+|balance_\w+)\s*\/\s*(reserve_\w+|balance_\w+)/,
            severity: Severity.CRITICAL,
            category: 'Economic Vulnerability',
            title: 'Price Manipulation Risk',
            description: 'Direct price calculation from reserves vulnerable to flash loan attacks',
            recommendation: 'Use time-weighted average price (TWAP) or external price oracles'
        },
        {
            pattern: /flash.*loan|borrow.*flash/i,
            severity: Severity.MEDIUM,
            category: 'Economic Vulnerability',
            title: 'Flash Loan Implementation',
            description: 'Flash loan functionality requires careful security considerations',
            recommendation: 'Implement proper flash loan protections, fees, and reentrancy guards'
        },

        {
            pattern: /public\s+fun\s+\w+\([^)]*\w+:\s*u\d+/,
            severity: Severity.MEDIUM,
            category: 'Input Validation',
            title: 'Missing Input Validation',
            description: 'Function accepts numeric parameters without validation',
            recommendation: 'Add input validation with appropriate bounds checking',
            checkFunction: this.checkInputValidation.bind(this)
        },

        {
            pattern: /unsafe_/,
            severity: Severity.HIGH,
            category: 'Dangerous Patterns',
            title: 'Unsafe Function Usage',
            description: 'Usage of unsafe function detected',
            recommendation: 'Review unsafe function usage and consider safer alternatives'
        },
        {
            pattern: /unchecked_/,
            severity: Severity.HIGH,
            category: 'Dangerous Patterns',
            title: 'Unchecked Operation',
            description: 'Unchecked operation that may lead to vulnerabilities',
            recommendation: 'Add proper checks and validations'
        },

        {
            pattern: /assert!\([^,]+\)(?!.*,\s*\d+)/,
            severity: Severity.LOW,
            category: 'Best Practices',
            title: 'Missing Error Code in Assert',
            description: 'Assert statement without error code for debugging',
            recommendation: 'Add error codes to assert! statements'
        },
        {
            pattern: /\b(100|1000|10000|1000000)\b(?!.*const)/,
            severity: Severity.LOW,
            category: 'Best Practices',
            title: 'Magic Number',
            description: 'Hard-coded number should be a named constant',
            recommendation: 'Define constants for magic numbers'
        },

        {
            pattern: /vote.*execute|execute.*vote/i,
            severity: Severity.MEDIUM,
            category: 'Governance',
            title: 'Missing Timelock',
            description: 'Governance operation without timelock delay',
            recommendation: 'Implement timelock mechanism between voting and execution'
        }
    ];

    public async auditFile(filePath: string): Promise<SecurityFinding[]> {
        this.currentFile = filePath;
        this.findings = [];

        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            this.lines = content.split('\n');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return [];
        }
        await this.runSecurityChecks();

        return [...this.findings];
    }

    public async auditDirectory(dirPath: string): Promise<AuditResult> {
        await this.performStaticAnalysis(dirPath);

        const moveFiles = await this.findMoveFiles(dirPath);
        const allFindings: SecurityFinding[] = [];

        for (const file of moveFiles) {
            console.log(`🔍 Auditing: ${file}`);
            const findings = await this.auditFile(file);
            allFindings.push(...findings);
        }

        return this.generateAuditResult(allFindings, moveFiles.length);
    }

    private async findMoveFiles(dirPath: string): Promise<string[]> {
        const sourcesPath = path.join(dirPath, 'sources');

        if (!fs.existsSync(sourcesPath)) {
            console.warn('⚠️ No "sources" directory found. Skipping audit.');
            return [];
        }

        const files: string[] = [];
        const entries = await fs.promises.readdir(sourcesPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(sourcesPath, entry.name);

            if (entry.isDirectory()) {
                const subDirFiles = await this.findMoveFiles(fullPath);
                files.push(...subDirFiles);
            } else if (entry.name.endsWith('.move')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    private async runSecurityChecks(): Promise<void> {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];

            for (const pattern of this.vulnerabilityPatterns) {
                if (this.shouldSkipPattern(pattern)) continue;

                const match = line.match(pattern.pattern);
                if (match) {
                    if (pattern.checkFunction) {
                        if (pattern.checkFunction(line, i, this.lines)) {
                            this.addFinding(pattern, i, match[1] || match[0]);
                        }
                    } else {
                        this.addFinding(pattern, i, match[1] || match[0]);
                    }
                }
            }
        }
        await this.checkStateConsistency();
        await this.checkComplexAccessControl();
        await this.checkReentrancyPatterns();
    }

    private checkAccessControl(line: string, lineIndex: number, allLines: string[]): boolean {
        const funcMatch = line.match(/public\s+fun\s+(\w+)/);
        // console.log(funcMatch);
        if (!funcMatch) return false;

        const funcName = funcMatch[1];

        const publicFunctionNames = ['initialize', 'create', 'new', 'get_', 'is_', 'has_', 'view_', 'read_'];
        if (publicFunctionNames.some(name => funcName.toLowerCase().includes(name))) {
            return false;
        }

        let braceCount = 0;
        let functionEnd = lineIndex;
        for (let j = lineIndex; j < allLines.length; j++) {
            braceCount += (allLines[j].match(/\{/g) || []).length;
            braceCount -= (allLines[j].match(/\}/g) || []).length;
            if (braceCount === 0 && j > lineIndex) {
                functionEnd = j;
                break;
            }
        }

        const functionBody = allLines.slice(lineIndex, functionEnd + 1).join('\n');

        const accessControlPatterns = [
            /_:\s*&\w*Cap\w*|\w+_cap:\s*&\w+/,
            /assert!\s*\([^)]*ctx\.sender\(\)\s*==\s*[^)]*\.owner/,
            /assert!\s*\([^)]*\.owner\s*==\s*[^)]*ctx\.sender\(\)/,
            /assert!\s*\([^)]*\.owner\s*==\s*[^)]*\)/,
            /assert!\s*\([^)]*admin|authority|owner/i,
            /has_permission|is_authorized|check_auth/,
            /whitelist|authorized_users/,
            /has_role|check_role|is_admin/
        ];

        let hasAccessControl = false;
        for (const pattern of accessControlPatterns) {
            if (pattern.test(functionBody)) {
                hasAccessControl = true;
                break;
            }
        }

        if (!hasAccessControl) {
            const structPattern = /struct\s+\w+\s+has[^{]*\{[^}]*owner\s*:\s*address/;
            const fileContent = allLines.join('\n');

            if (structPattern.test(fileContent)) {
                const ownerAssertPattern = /assert!\s*\([^)]*\.owner\s*==|assert!\s*\([^)]*ctx\.sender\(\)\s*==/;
                if (ownerAssertPattern.test(functionBody)) {
                    hasAccessControl = true;
                }
            }
        }

        const sensitiveOps = ['transfer', 'coin::', 'balance', 'withdraw', 'mint', 'burn', 'destroy', 'split', 'join'];
        const hasSensitiveOps = sensitiveOps.some(op => functionBody.includes(op));

        const isFinancialOp = /withdraw|transfer|mint|burn|deposit|swap|exchange/i.test(funcName);

        return hasSensitiveOps && !hasAccessControl && (isFinancialOp || funcName.includes('admin') || funcName.includes('owner'));
    }

    private checkInputValidation(line: string, lineIndex: number, allLines: string[]): boolean {
        const nextLines = allLines.slice(lineIndex + 1, lineIndex + 10);
        const hasValidation = nextLines.some(nextLine =>
            /assert!/.test(nextLine) ||
            /require!/.test(nextLine) ||
            /abort_if/.test(nextLine)
        );

        return !hasValidation;
    }

    private async checkStateConsistency(): Promise<void> {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];

            const externalCalls = ['transfer::', 'event::', 'coin::from_balance'];

            for (const call of externalCalls) {
                if (line.includes(call)) {
                    for (let j = i + 1; j < Math.min(i + 10, this.lines.length); j++) {
                        if (/\w+\.\w+\s*=/.test(this.lines[j])) {
                            this.addFinding({
                                pattern: /./,
                                severity: Severity.MEDIUM,
                                category: 'State Consistency',
                                title: 'State Change After External Call',
                                description: 'State modification after external call violates CEI pattern',
                                recommendation: 'Move state changes before external calls (Checks-Effects-Interactions)'
                            }, j, this.lines[j].trim());
                            break;
                        }
                    }
                }
            }
        }
    }

    private async checkComplexAccessControl(): Promise<void> {
        // Check for admin functions without proper protection
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];

            if (/public\s+fun\s+(admin_|owner_|set_|update_|change_)/.test(line)) {
                // Look for various access control patterns in the function
                const functionBody = this.getFunctionBody(i);

                const hasAccessControl = [
                    /admin|owner|cap/i.test(functionBody) && /assert!/.test(functionBody),
                    /ctx\.sender\(\)\s*==/.test(functionBody),
                    /has_permission|is_authorized|check_auth/.test(functionBody),
                    /_:\s*&\w*Cap\w*/.test(functionBody)
                ].some(Boolean);

                if (!hasAccessControl) {
                    this.addFinding({
                        pattern: /./,
                        severity: Severity.CRITICAL,
                        category: 'Access Control',
                        title: 'Unprotected Administrative Function',
                        description: 'Administrative function lacks proper access control',
                        recommendation: 'Add administrator capability checks, owner verification, or role-based access control'
                    }, i, line.trim());
                }
            }
        }
    }

    private getFunctionBody(startLine: number): string {
        let braceCount = 0;
        let endLine = startLine;

        for (let j = startLine; j < this.lines.length; j++) {
            braceCount += (this.lines[j].match(/\{/g) || []).length;
            braceCount -= (this.lines[j].match(/\}/g) || []).length;

            if (braceCount === 0 && j > startLine) {
                endLine = j;
                break;
            }
        }

        return this.lines.slice(startLine, endLine + 1).join('\n');
    }

    private async checkReentrancyPatterns(): Promise<void> {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];

            if (/call|invoke|execute/.test(line) && /external|cross/.test(line)) {
                const hasReentrancyGuard = this.lines.slice(Math.max(0, i - 5), i + 10).some(l =>
                    /reentrancy|guard|lock|mutex/.test(l)
                );

                if (!hasReentrancyGuard) {
                    this.addFinding({
                        pattern: /./,
                        severity: Severity.HIGH,
                        category: 'Reentrancy',
                        title: 'Potential Reentrancy Vulnerability',
                        description: 'External call without reentrancy protection',
                        recommendation: 'Implement reentrancy guards or use CEI pattern'
                    }, i, line.trim());
                }
            }
        }
    }

    private shouldSkipPattern(pattern: VulnerabilityPattern): boolean {
        if (this.config.enabledCategories.includes('all')) return false;
        return !this.config.enabledCategories.includes(pattern.category);
    }

    private addFinding(
        pattern: VulnerabilityPattern,
        lineIndex: number,
        matchedText: string,
        confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    ): void {
        const codeSnippet = this.getCodeSnippet(lineIndex);

        const finding: SecurityFinding = {
            severity: pattern.severity,
            category: pattern.category,
            title: pattern.title,
            description: `${pattern.description}: ${matchedText}`,
            lineNumber: lineIndex + 1,
            codeSnippet,
            recommendation: pattern.recommendation,
            fileName: this.currentFile,
            confidence
        };

        this.findings.push(finding);
    }

    private findMoveProjectRoot(filePath: string): string | null {
        let currentDir = path.dirname(filePath);

        while (currentDir !== path.parse(currentDir).root) {
            if (fs.existsSync(path.join(currentDir, 'Move.toml'))) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }

        return null;
    }

    private getCodeSnippet(lineIndex: number): string {
        const start = Math.max(0, lineIndex - 2);
        const end = Math.min(this.lines.length, lineIndex + 3);

        return this.lines
            .slice(start, end)
            .map((line, idx) => {
                const actualLineNum = start + idx + 1;
                const marker = actualLineNum === lineIndex + 1 ? '→' : ' ';
                return `${marker} ${actualLineNum.toString().padStart(4)}: ${line}`;
            })
            .join('\n');
    }

    private generateAuditResult(findings: SecurityFinding[], filesAudited: number): AuditResult {
        const severityCounts: Record<Severity, number> = {
            [Severity.CRITICAL]: 0,
            [Severity.HIGH]: 0,
            [Severity.MEDIUM]: 0,
            [Severity.LOW]: 0,
            [Severity.INFO]: 0
        };

        findings.forEach(finding => {
            severityCounts[finding.severity]++;
        });

        return {
            findings: findings.sort((a, b) => {
                const severityOrder = {
                    [Severity.CRITICAL]: 0,
                    [Severity.HIGH]: 1,
                    [Severity.MEDIUM]: 2,
                    [Severity.LOW]: 3,
                    [Severity.INFO]: 4
                };
                return severityOrder[a.severity] - severityOrder[b.severity];
            }),
            summary: {
                totalFindings: findings.length,
                severityCounts,
                filesAudited,
                criticalIssues: severityCounts[Severity.CRITICAL] + severityCounts[Severity.HIGH]
            }
        };
    }

    public generateReport(result: AuditResult, outputPath?: string): string {
        const report = this.buildMarkdownReport(result);

        if (outputPath) {
            fs.writeFileSync(outputPath, report);
            console.log(`📄 Report saved to: ${outputPath}`);
        }

        return report;
    }

    public buildMarkdownReport(result: AuditResult): string {
        const { findings, summary } = result;

        const lines = [
            '# 🛡️ Move Smart Contract Security Audit Report',
            '',
            `**Generated:** ${new Date().toISOString()}`,
            `**Files Audited:** ${summary.filesAudited}`,
            `**Total Findings:** ${summary.totalFindings}`,
            '',
            '## 📊 Executive Summary',
            '',
            this.buildSeverityTable(summary.severityCounts),
            ''
        ];

        if (summary.criticalIssues > 0) {
            lines.push('⚠️ **CRITICAL ISSUES FOUND** - Immediate attention required!', '');
        }

        lines.push('## 🔍 Detailed Findings', '');

        findings.forEach((finding, index) => {
            const emoji = this.getSeverityEmoji(finding.severity);
            lines.push(
                `### ${index + 1}. ${emoji} ${finding.title}`,
                '',
                `**Severity:** ${finding.severity}`,
                `**Category:** ${finding.category}`,
                `**File:** ${finding.fileName}`,
                `**Line:** ${finding.lineNumber}`,
                `**Confidence:** ${finding.confidence}`,
                '',
                `**Description:** ${finding.description}`,
                '',
                '**Code:**',
                '```move',
                finding.codeSnippet,
                '```',
                '',
                `**Recommendation:** ${finding.recommendation}`,
                '',
                '---',
                ''
            );
        });

        lines.push(
            '## 🛠️ Remediation Priority',
            '',
            '1. **Critical & High**: Fix immediately before deployment',
            '2. **Medium**: Address in next development cycle',
            '3. **Low & Info**: Consider for code quality improvements',
            '',
            '---',
            '*Generated by Move Security Auditor*'
        );

        return lines.join('\n');
    }

    private buildSeverityTable(counts: Record<Severity, number>): string {
        const rows = [
            '| Severity | Count | Priority |',
            '|----------|-------|----------|'
        ];

        Object.entries(counts).forEach(([severity, count]) => {
            if (count > 0) {
                const emoji = this.getSeverityEmoji(severity as Severity);
                const priority = this.getSeverityPriority(severity as Severity);
                rows.push(`| ${emoji} ${severity} | ${count} | ${priority} |`);
            }
        });

        return rows.join('\n');
    }

    private getSeverityEmoji(severity: Severity): string {
        const emojis = {
            [Severity.CRITICAL]: '🔴',
            [Severity.HIGH]: '🟠',
            [Severity.MEDIUM]: '🟡',
            [Severity.LOW]: '🔵',
            [Severity.INFO]: '⚪'
        };
        return emojis[severity];
    }

    private getSeverityPriority(severity: Severity): string {
        const priorities = {
            [Severity.CRITICAL]: 'Immediate',
            [Severity.HIGH]: 'High',
            [Severity.MEDIUM]: 'Medium',
            [Severity.LOW]: 'Low',
            [Severity.INFO]: 'Info'
        };
        return priorities[severity];
    }
}

async function main() {
    const program = new Command();

    program
        .name('move-auditor')
        .description('Move Smart Contract Security Auditor')
        .version('1.0.0');

    program
        .argument('<path>', 'File or directory to audit')
        .option('-o, --output <file>', 'Output report file')
        .option('-f, --format <format>', 'Report format (markdown|json)', 'markdown')
        .option('-s, --severity <level>', 'Minimum severity level', 'INFO')
        .option('-c, --categories <categories>', 'Comma-separated list of categories to check')
        .option('--json', 'Output as JSON')
        .option('--quiet', 'Suppress console output')
        .action(async (inputPath, options) => {
            try {
                const config: Partial<AuditConfig> = {
                    severityThreshold: options.severity as Severity,
                    enabledCategories: options.categories ? options.categories.split(',') : ['all']
                };

                const auditor = new MoveSecurityAuditor(config);

                if (!options.quiet) {
                    console.log('🚀 Starting Move Security Audit...\n');
                }

                const stats = await fs.promises.stat(inputPath);
                let result: AuditResult;

                if (stats.isDirectory()) {
                    result = await auditor.auditDirectory(inputPath);
                } else {
                    const projectRoot = auditor['findMoveProjectRoot'](inputPath);
                    if (projectRoot) {
                        await auditor.performStaticAnalysis(projectRoot);
                    }
                    const findings = await auditor.auditFile(inputPath);
                    result = auditor['generateAuditResult'](findings, 1);
                }
                if (options.json) {
                    const jsonOutput = JSON.stringify(result, null, 2);
                    if (options.output) {
                        await fs.promises.writeFile(options.output, jsonOutput);
                    } else {
                        console.log(jsonOutput);
                    }
                } else {
                    auditor.generateReport(result, options.output);

                    if (!options.quiet && !options.output) {
                        console.log('\n📋 Audit Summary:');
                        console.log(`Files: ${result.summary.filesAudited}`);
                        console.log(`Findings: ${result.summary.totalFindings}`);
                        console.log(`Critical/High: ${result.summary.criticalIssues}`);
                    }
                }
                if (result.summary.criticalIssues > 0) {
                    process.exit(1);
                }

            } catch (error) {
                console.error('❌ Audit failed:', error);
                process.exit(1);
            }
        });

    await program.parseAsync();
}

export { MoveSecurityAuditor, Severity, SecurityFinding, AuditResult };


if (require.main === module) {
    main().catch(console.error);
}

// async function auditSingleFile(filePath: string) {
//     const auditor = new MoveSecurityAuditor();

//     try {
//         console.log(`🔍 Auditing file: ${filePath}`);
//         const findings = await auditor.auditFile(filePath);
//         const result = {
//             findings,
//             summary: {
//                 totalFindings: findings.length,
//                 severityCounts: {
//                     CRITICAL: findings.filter(f => f.severity === Severity.CRITICAL).length,
//                     HIGH: findings.filter(f => f.severity === Severity.HIGH).length,
//                     MEDIUM: findings.filter(f => f.severity === Severity.MEDIUM).length,
//                     LOW: findings.filter(f => f.severity === Severity.LOW).length,
//                     INFO: findings.filter(f => f.severity === Severity.INFO).length
//                 },
//                 filesAudited: 1,
//                 criticalIssues: findings.filter(f =>
//                     f.severity === Severity.CRITICAL || f.severity === Severity.HIGH
//                 ).length
//             }
//         };

//         const report = new MoveSecurityAuditor().buildMarkdownReport(result);
//         console.log(report);

//         if (result.summary.criticalIssues > 0) {
//             process.exit(1);
//         }
//     } catch (error) {
//         console.error(`❌ Error auditing file: ${error}`);
//         process.exit(1);
//     }
// }

// const fileToAudit = 'test/sources/test.move';
// auditSingleFile(fileToAudit).catch(console.error);