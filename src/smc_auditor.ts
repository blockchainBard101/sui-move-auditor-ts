class SuiMoveAuditor {
    private async performStaticAnalysis(contractPath: string): Promise<void> {
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
}

import * as fs from 'fs';
import * as path from 'path';
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


class MoveSecurityAuditor {
    private findings: SecurityFinding[] = [];
    private currentFile: string = '';
    private lines: string[] = [];
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
    ]

    public async auditFile(filePath: string): Promise<SecurityFinding[]> {
        this.currentFile = filePath;
        this.findings = [];
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            this.lines = content.split('\n');
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error)
            return [];
        }

        await this.runSecurityChecks();
        return [...this.findings];
    }

    private async runSecurityChecks() {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];

            for (const pattern of this.vulnerabilityPatterns) {

                const match = line.match(pattern.pattern);
                if (match) {
                    if (pattern.checkFunction) {
                        if (pattern.checkFunction(line, i, this.lines)) {
                            this.addFinding(pattern, i, match[1] || match[0])
                        }
                    } else {
                        this.addFinding(pattern, i, match[1] || match[0])
                    }
                }
            }
        }
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

    private checkAccessControl(line: string, lineIndex: number, allLines: string[]): boolean {
        const funcMatch = line.match(/public\s+fun\s+(\w+)/);
        if (!funcMatch) return false;

        const funcName = funcMatch[1];

        const publicFunctionNames = ['initialize', 'create', 'new', 'get_', 'is_', 'has_', 'view_', 'read_'];
        if (publicFunctionNames.some(name => funcName.toLocaleLowerCase().includes(name))) {
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
}

async function main(filePath: string) {
    const auditor = new MoveSecurityAuditor();
    auditor.auditFile(filePath);
}

const fileToAudit = 'test/sources/test.move';
main(fileToAudit).catch(console.error);