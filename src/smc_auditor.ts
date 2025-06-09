// import { execSync } from 'child_process';
// import * as fs from 'fs';
// import * as path from 'path';

// class SuiMoveAuditor {
//     private async performStaticAnalysis(contractPath: string): Promise<void> {
//         try {
//             console.log('🔧 Performing static analysis...');

//             if (fs.statSync(contractPath).isDirectory()) {
//                 if (fs.existsSync(path.join(contractPath, 'Move.toml'))) {
//                     try {
//                         const output = execSync(`sui move build`, {
//                             cwd: contractPath,
//                             encoding: 'utf-8'
//                         });
//                         console.log('✅ Contract compilation successful');
//                         console.log(output);
//                     } catch (error: any) {
//                         console.log('⚠️  Compilation warnings/errors detected');
//                         if (error.stderr) {
//                             console.error('Error details:');
//                             console.error(error.stderr.toString());
//                         } else if (error.output) {
//                             console.error('Error details:');
//                             error.output.forEach((buffer: Buffer) => {
//                                 if (buffer) console.error(buffer.toString());
//                             });
//                         } else {
//                             console.error('Unknown error:', error);
//                         }
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log('⚠️  Static analysis encountered issues:');
//             console.error(error);
//         }
//     }
// }

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
    checkFunction?: (line: string, lineIndex: number, allLines: string[]) => void;
}

class MoveSecurityAuditor {
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

    public async auditFile(filePath: string){
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            this.lines = content.split('\n');
        } catch (error) {
           console.error(`Error reading ${filePath}:`, error) 
        }

        await this.runSecurityChecks();
    }

    private async runSecurityChecks(){
        for (let i = 0; i < this.lines.length; i++){
            const line = this.lines[i];

            for (const pattern of this.vulnerabilityPatterns){

                const match = line.match(pattern.pattern);
                if(match){
                    if(pattern.checkFunction){
                        pattern.checkFunction(line, i, this.lines)
                    } else {

                    }
                }
            }
        }
    }

    private checkAccessControl(line: string, lineIndex: number, allLines: string[]){
        const funcMatch = line.match(/public\s+fun\s+(\w+)/);

    }
}

async function main(filePath: string){
    const auditor = new MoveSecurityAuditor();
    auditor.auditFile(filePath);
}

const fileToAudit = 'test/sources/test.move';
main(fileToAudit).catch(console.error);