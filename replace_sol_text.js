const fs = require('fs');
const path = require('path');

// 변경할 대상 텍스트 패턴들 (긴 패턴부터 짧은 패턴 순서로 정렬)
// 이 순서가 중요합니다 - 긴 패턴을 먼저 매칭해야 짧은 패턴과 겹치지 않습니다
const patterns = [
    { pattern: /신한쏠\(SOL\)뱅크/g, name: '신한쏠(SOL)뱅크' },
    { pattern: /신한쏠\(SOL\)/g, name: '신한쏠(SOL)' },
    { pattern: /신한SOL뱅크/g, name: '신한SOL뱅크' },
    { pattern: /신한쏠뱅크/g, name: '신한쏠뱅크' },
    { pattern: /슈퍼쏠\(SOL\)/g, name: '슈퍼쏠(SOL)' },
    { pattern: /쏠\(SOL\)뱅크/g, name: '쏠(SOL)뱅크' },
    { pattern: /쏠\s+뱅크/g, name: '쏠 뱅크' },
    { pattern: /쏠뱅크/g, name: '쏠뱅크' },
    { pattern: /SOL뱅크/g, name: 'SOL뱅크' },
    { pattern: /신한쏠/g, name: '신한쏠' },
    { pattern: /신한SOL/g, name: '신한SOL' },
    { pattern: /슈퍼쏠/g, name: '슈퍼쏠' },
    { pattern: /슈퍼SOL/g, name: '슈퍼SOL' },
    { pattern: /쏠\(SOL\)/g, name: '쏠(SOL)' },
    // 단독 '쏠'은 다른 패턴들과 겹치지 않도록 마지막에 처리
    // 앞뒤가 한글/영문/숫자가 아닌 경우만 매칭 (단어 경계)
    { pattern: /(?<![가-힣a-zA-Z0-9])쏠(?![가-힣a-zA-Z0-9\(])/g, name: '쏠' },
];

// 변경할 텍스트
const replacement = '신한 슈퍼SOL';

// 결과 저장 배열
const results = [];

// HTML 파일을 재귀적으로 찾는 함수
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// HTML 파일 처리 함수
function processHtmlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;
        const fileResults = [];
        
        // 각 라인을 처리
        const newLines = lines.map((line, index) => {
            const originalLine = line;
            let workingLine = line;
            let lineModified = false;
            const lineResults = [];
            const replacements = []; // {original, marker, name, startIndex} 배열
            
            // 각 패턴을 순서대로 확인 (긴 패턴부터 먼저 확인)
            for (const { pattern, name } of patterns) {
                // 패턴을 복사하여 사용 (원본 패턴의 lastIndex가 변경되지 않도록)
                const regex = new RegExp(pattern.source, pattern.flags);
                let match;
                const matches = [];
                
                // 원본 라인에서 모든 매칭 찾기
                while ((match = regex.exec(originalLine)) !== null) {
                    // 이미 교체된 부분인지 확인
                    let isReplaced = false;
                    for (const rep of replacements) {
                        if (match.index >= rep.startIndex && 
                            match.index < rep.startIndex + rep.original.length) {
                            isReplaced = true;
                            break;
                        }
                    }
                    
                    if (!isReplaced) {
                        matches.push({
                            index: match.index,
                            text: match[0]
                        });
                    }
                }
                
                // 역순으로 교체하여 인덱스가 변경되지 않도록 함
                for (let i = matches.length - 1; i >= 0; i--) {
                    const match = matches[i];
                    const marker = `__REPLACE_${replacements.length}__`;
                    
                    lineResults.push({
                        lineNumber: index + 1,
                        original: match.text,
                        patternName: name
                    });
                    
                    replacements.push({
                        original: match.text,
                        marker: marker,
                        name: name,
                        startIndex: match.index
                    });
                    
                    // workingLine에서 원본 라인 기준 인덱스로 교체
                    // workingLine은 이미 일부가 마커로 교체되었을 수 있으므로,
                    // 원본 라인 기준 인덱스를 사용하여 정확한 위치를 찾아야 함
                    // 마커를 원본 텍스트로 복원하여 인덱스 계산
                    let tempLine = workingLine;
                    replacements.slice(0, -1).forEach(rep => {
                        tempLine = tempLine.replace(rep.marker, rep.original);
                    });
                    
                    const actualIndex = tempLine.indexOf(match.text, match.index);
                    if (actualIndex !== -1) {
                        workingLine = tempLine.substring(0, actualIndex) + 
                                     marker + 
                                     tempLine.substring(actualIndex + match.text.length);
                    } else {
                        // fallback: 원본 라인 기준으로 직접 교체
                        workingLine = originalLine.substring(0, match.index) + 
                                     marker + 
                                     originalLine.substring(match.index + match.text.length);
                        // 이전 마커들을 다시 적용
                        replacements.slice(0, -1).forEach(rep => {
                            workingLine = workingLine.replace(rep.original, rep.marker);
                        });
                    }
                    lineModified = true;
                }
            }
            
            // 마커를 최종 교체 텍스트로 변경
            if (lineModified) {
                replacements.forEach(rep => {
                    workingLine = workingLine.replace(rep.marker, replacement);
                });
                modified = true;
                fileResults.push(...lineResults);
            }
            
            return workingLine;
        });
        
        // 파일이 수정된 경우 저장
        if (modified) {
            fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
            
            // 결과에 추가
            fileResults.forEach(result => {
                results.push({
                    filePath: path.relative(process.cwd(), filePath),
                    fileName: path.basename(filePath),
                    lineNumber: result.lineNumber,
                    original: result.original,
                    replaced: replacement
                });
            });
            
            console.log(`✓ 처리 완료: ${filePath} (${fileResults.length}개 변경)`);
        }
        
        return modified;
    } catch (error) {
        console.error(`✗ 오류 발생 (${filePath}):`, error.message);
        return false;
    }
}

// 결과 HTML 생성 함수
function generateResultHtml() {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>텍스트 변경 결과</title>
    <style>
        body {
            font-family: 'Malgun Gothic', sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .summary {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #e8f4f8;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #0471E9;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .file-name {
            font-weight: 500;
            color: #0471E9;
        }
        .line-number {
            text-align: center;
            color: #666;
        }
        .original {
            color: #d32f2f;
            font-weight: 500;
        }
        .arrow {
            color: #999;
            padding: 0 10px;
        }
        .replaced {
            color: #1976d2;
            font-weight: 500;
        }
        .count {
            font-size: 18px;
            font-weight: bold;
            color: #0471E9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>텍스트 변경 결과 리포트</h1>
        <div class="summary">
            <p><strong>총 변경 건수:</strong> <span class="count">${results.length}</span>건</p>
            <p><strong>변경된 파일 수:</strong> <span class="count">${new Set(results.map(r => r.filePath)).size}</span>개</p>
            <p><strong>변경 대상:</strong> 다양한 '쏠', 'SOL' 관련 텍스트</p>
            <p><strong>변경 결과:</strong> '신한 슈퍼SOL'</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">HTML 파일명</th>
                    <th style="width: 10%;">라인 번호</th>
                    <th style="width: 32.5%;">변경 전 텍스트</th>
                    <th style="width: 32.5%;">변경 후 텍스트</th>
                </tr>
            </thead>
            <tbody>
${results.map(result => `
                <tr>
                    <td class="file-name">${result.fileName}</td>
                    <td class="line-number">${result.lineNumber}</td>
                    <td class="original">${escapeHtml(result.original)}</td>
                    <td><span class="arrow">→</span><span class="replaced">${escapeHtml(result.replaced)}</span></td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    return htmlContent;
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 메인 실행
function main() {
    const htmlDir = path.join(__dirname, 'html');
    
    if (!fs.existsSync(htmlDir)) {
        console.error('html 디렉토리를 찾을 수 없습니다.');
        process.exit(1);
    }
    
    console.log('HTML 파일 검색 중...');
    const htmlFiles = findHtmlFiles(htmlDir);
    console.log(`총 ${htmlFiles.length}개의 HTML 파일을 찾았습니다.\n`);
    
    console.log('텍스트 변경 작업 시작...\n');
    let processedCount = 0;
    
    htmlFiles.forEach(filePath => {
        if (processHtmlFile(filePath)) {
            processedCount++;
        }
    });
    
    console.log(`\n작업 완료! ${processedCount}개 파일이 변경되었습니다.`);
    
    // 결과 HTML 생성
    if (results.length > 0) {
        const resultHtml = generateResultHtml();
        const resultPath = path.join(__dirname, 'replace_result.html');
        fs.writeFileSync(resultPath, resultHtml, 'utf8');
        console.log(`\n결과 리포트가 생성되었습니다: ${resultPath}`);
    } else {
        console.log('\n변경된 내용이 없습니다.');
    }
}

// 스크립트 실행
main();
