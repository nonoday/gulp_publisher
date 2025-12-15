const fs = require('fs');
const path = require('path');

// color 속성에서만 컬러 값 추출 여부 확인
function isColorProperty(content, position) {
    // 컬러 값 앞 300자 범위 내에서 가장 가까운 속성 찾기
    const startPos = Math.max(0, position - 300);
    const beforeText = content.substring(startPos, position);
    const beforeTextLower = beforeText.toLowerCase();
    
    // 색상 값 바로 앞에서 역순으로 검색하여 가장 가까운 속성 이름 찾기
    // 세미콜론, 중괄호, 줄바꿈을 만나면 그 이후의 속성을 찾음
    const lastSemicolon = beforeTextLower.lastIndexOf(';');
    const lastBrace = beforeTextLower.lastIndexOf('}');
    const lastNewline = beforeTextLower.lastIndexOf('\n');
    
    // 가장 최근의 구분자 위치 찾기
    const lastSeparator = Math.max(lastSemicolon, lastBrace, lastNewline);
    const searchStart = lastSeparator > 0 ? lastSeparator : 0;
    const propertyText = beforeTextLower.substring(searchStart);
    
    // 정확히 "color" 속성만 매칭 (앞에 하이픈이 없어야 함)
    // 패턴: 시작/공백/줄바꿈/중괄호 뒤에 "color"가 오고, 그 뒤에 공백과 콜론/등호
    // 예: "color:", " color:", "\ncolor:", "{color:", ";color:"
    // 제외: "-color" 형태 (예: "background-color:", "border-color:")
    
    // 먼저 "-color" 형태가 있는지 확인 (이 경우 제외)
    if (/[a-z-]+-color\s*[:=]/.test(propertyText)) {
        return false;
    }
    
    // 정확히 "color" 속성만 매칭
    // 패턴: (시작 또는 공백/중괄호/세미콜론) + "color" + 공백 + (콜론 또는 등호)
    const colorPattern = /(?:^|[\s{;])color\s*[:=]/;
    
    return colorPattern.test(propertyText);
}

// Hex 값을 RGB로 변환
function hexToRgb(hex) {
    // 3자리 hex를 6자리로 확장 (#fff -> #ffffff)
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    // 8자리 hex (alpha 포함)는 alpha를 무시하고 RGB만 추출
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// CSS 주석 제거
function removeComments(content) {
    // /* */ 형태의 주석 제거
    return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Hex 컬러 값 추출 (color 속성만)
function extractHexColors(content) {
    // 주석 제거
    const cleanContent = removeComments(content);
    const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/gi;
    const colors = [];
    let match;
    
    while ((match = hexPattern.exec(cleanContent)) !== null) {
        const hex = match[0];
        const position = match.index;
        
        // color 속성에서만 추출
        if (isColorProperty(cleanContent, position)) {
            const rgb = hexToRgb(hex);
            if (rgb) {
                colors.push({
                    value: hex.toLowerCase(),
                    rgb: rgb,
                    type: 'hex',
                    property: 'color'
                });
            }
        }
    }
    
    // 중복 제거
    const uniqueColors = [];
    const seen = new Set();
    
    colors.forEach(color => {
        if (!seen.has(color.value)) {
            seen.add(color.value);
            uniqueColors.push(color);
        }
    });
    
    return uniqueColors;
}

// RGBA 값을 파싱
function parseRgba(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }
    return null;
}

// RGBA 컬러 값 추출 (color 속성만)
function extractRgbaColors(content) {
    // 주석 제거
    const cleanContent = removeComments(content);
    const rgbaPattern = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/gi;
    const colors = [];
    let match;
    
    while ((match = rgbaPattern.exec(cleanContent)) !== null) {
        const rgba = match[0].toLowerCase();
        const position = match.index;
        
        // color 속성에서만 추출
        if (isColorProperty(cleanContent, position)) {
            const parsed = parseRgba(rgba);
            if (parsed) {
                colors.push({
                    value: rgba,
                    rgb: { r: parsed.r, g: parsed.g, b: parsed.b },
                    alpha: parsed.a,
                    type: 'rgba',
                    property: 'color'
                });
            }
        }
    }
    
    // 중복 제거
    const uniqueColors = [];
    const seen = new Set();
    
    colors.forEach(color => {
        if (!seen.has(color.value)) {
            seen.add(color.value);
            uniqueColors.push(color);
        }
    });
    
    return uniqueColors;
}

// 두 색상 간의 유클리드 거리 계산
function colorDistance(rgb1, rgb2) {
    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

// 비슷한 색상끼리 그룹화 (임계값: 30)
function groupSimilarColors(colors, threshold = 30) {
    const groups = [];
    const used = new Set();
    
    colors.forEach((color, index) => {
        if (used.has(index)) return;
        
        const group = [color];
        used.add(index);
        
        // 현재 색상과 비슷한 색상 찾기
        colors.forEach((otherColor, otherIndex) => {
            if (index === otherIndex || used.has(otherIndex)) return;
            
            const distance = colorDistance(color.rgb, otherColor.rgb);
            if (distance <= threshold) {
                group.push(otherColor);
                used.add(otherIndex);
            }
        });
        
        // 그룹 내 색상을 밝기 순으로 정렬
        group.sort((a, b) => {
            const brightnessA = a.rgb.r * 0.299 + a.rgb.g * 0.587 + a.rgb.b * 0.114;
            const brightnessB = b.rgb.r * 0.299 + b.rgb.g * 0.587 + b.rgb.b * 0.114;
            return brightnessA - brightnessB;
        });
        
        groups.push(group);
    });
    
    // 그룹을 대표 색상의 밝기 순으로 정렬
    groups.sort((a, b) => {
        const brightnessA = a[0].rgb.r * 0.299 + a[0].rgb.g * 0.587 + a[0].rgb.b * 0.114;
        const brightnessB = b[0].rgb.r * 0.299 + b[0].rgb.g * 0.587 + b[0].rgb.b * 0.114;
        return brightnessA - brightnessB;
    });
    
    return groups;
}

// 단일 CSS 파일에서 컬러 추출
function extractColorsFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hexColors = extractHexColors(content);
        const rgbaColors = extractRgbaColors(content);
        
        return {
            file: filePath,
            hexColors: hexColors,
            rgbaColors: rgbaColors,
            hexCount: hexColors.length,
            rgbaCount: rgbaColors.length,
            colorCount: hexColors.length + rgbaColors.length
        };
    } catch (error) {
        console.error(`  ❌ 파일 읽기 오류: ${error.message}`);
        return null;
    }
}

// CSS 폴더 내의 모든 CSS 파일 처리
function processCssFolder(cssPath) {
    const results = [];
    
    // 파일인지 폴더인지 확인
    const stats = fs.statSync(cssPath);
    
    if (stats.isFile()) {
        // 단일 파일 처리
        if (!cssPath.endsWith('.css')) {
            console.error('❌ CSS 파일이 아닙니다.');
            return;
        }
        
        const result = extractColorsFromFile(cssPath);
        if (result) {
            results.push(result);
        }
    } else if (stats.isDirectory()) {
        // 폴더인 경우 재귀적으로 모든 CSS 파일 찾기
        const files = fs.readdirSync(cssPath, { recursive: true });
        const cssFiles = files.filter(file => {
            const fullPath = path.join(cssPath, file);
            return file.endsWith('.css') && fs.statSync(fullPath).isFile();
        });
        
        if (cssFiles.length === 0) {
            console.log('⚠️  CSS 파일을 찾을 수 없습니다.');
            return;
        }
        
        console.log(`\n📁 ${cssFiles.length}개의 CSS 파일을 처리합니다...\n`);
        
        cssFiles.forEach(cssFile => {
            const filePath = path.join(cssPath, cssFile);
            console.log(`📄 처리 중: ${cssFile}`);
            
            const result = extractColorsFromFile(filePath);
            if (result) {
                results.push(result);
                console.log(`  ✅ Hex: ${result.hexCount}개, RGBA: ${result.rgbaCount}개\n`);
            }
        });
    } else {
        console.error('❌ 파일 또는 폴더를 찾을 수 없습니다.');
        return;
    }
    
    return results;
}

// 결과 출력
function printResults(results) {
    if (!results || results.length === 0) {
        console.log('\n⚠️  추출된 컬러 값이 없습니다.');
        return;
    }
    
    // 전체 색상 수집 (hex와 rgba 분리)
    const allHexColors = [];
    const allRgbaColors = [];
    
    results.forEach(result => {
        allHexColors.push(...result.hexColors);
        allRgbaColors.push(...result.rgbaColors);
    });
    
    // 중복 제거 (RGB 값 기준)
    const uniqueHexColors = [];
    const uniqueRgbaColors = [];
    const seenHex = new Set();
    const seenRgba = new Set();
    
    // Hex 중복 제거
    allHexColors.forEach(color => {
        const rgbKey = `${color.rgb.r},${color.rgb.g},${color.rgb.b}`;
        if (!seenHex.has(rgbKey)) {
            seenHex.add(rgbKey);
            uniqueHexColors.push(color);
        }
    });
    
    // RGBA 중복 제거
    allRgbaColors.forEach(color => {
        const rgbKey = `${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.alpha || 1}`;
        if (!seenRgba.has(rgbKey)) {
            seenRgba.add(rgbKey);
            uniqueRgbaColors.push(color);
        }
    });
    
    // 각각 그룹화
    const hexGroups = groupSimilarColors(uniqueHexColors);
    const rgbaGroups = groupSimilarColors(uniqueRgbaColors);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 추출 결과 요약');
    console.log('='.repeat(60));
    console.log(`\n📁 처리된 파일 수: ${results.length}개`);
    console.log(`🎨 Hex 색상 수: ${uniqueHexColors.length}개 (그룹: ${hexGroups.length}개)`);
    console.log(`🎨 RGBA 색상 수: ${uniqueRgbaColors.length}개 (그룹: ${rgbaGroups.length}개)`);
    console.log(`🎨 전체 색상 수: ${uniqueHexColors.length + uniqueRgbaColors.length}개`);
    
    // 파일별 상세 정보
    console.log('\n' + '='.repeat(60));
    console.log('📄 파일별 상세 정보');
    console.log('='.repeat(60));
    
    results.forEach(result => {
        console.log(`\n📄 ${result.file}`);
        console.log(`   Hex: ${result.hexCount}개, RGBA: ${result.rgbaCount}개`);
    });
    
    // Hex 색상 그룹별 출력
    console.log('\n' + '='.repeat(60));
    console.log('🎨 Hex 색상 그룹별 목록');
    console.log('='.repeat(60));
    
    hexGroups.forEach((group, groupIndex) => {
        console.log(`\nHex 그룹 ${groupIndex + 1} (${group.length}개 색상):`);
        group.forEach((color, colorIndex) => {
            const brightness = color.rgb.r * 0.299 + color.rgb.g * 0.587 + color.rgb.b * 0.114;
            console.log(`  ${colorIndex + 1}. ${color.value} (RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 밝기: ${brightness.toFixed(1)})`);
        });
    });
    
    // RGBA 색상 그룹별 출력
    console.log('\n' + '='.repeat(60));
    console.log('🎨 RGBA 색상 그룹별 목록');
    console.log('='.repeat(60));
    
    rgbaGroups.forEach((group, groupIndex) => {
        console.log(`\nRGBA 그룹 ${groupIndex + 1} (${group.length}개 색상):`);
        group.forEach((color, colorIndex) => {
            const brightness = color.rgb.r * 0.299 + color.rgb.g * 0.587 + color.rgb.b * 0.114;
            console.log(`  ${colorIndex + 1}. ${color.value} (RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, Alpha: ${color.alpha || 1}, 밝기: ${brightness.toFixed(1)})`);
        });
    });
    
    // JSON 데이터 생성
    const jsonData = {
        summary: {
            totalFiles: results.length,
            totalHexColors: uniqueHexColors.length,
            totalRgbaColors: uniqueRgbaColors.length,
            totalColors: uniqueHexColors.length + uniqueRgbaColors.length,
            hexGroups: hexGroups.length,
            rgbaGroups: rgbaGroups.length
        },
        hexColorGroups: hexGroups.map((group, index) => ({
            groupId: index + 1,
            colors: group.map(color => ({
                value: color.value,
                rgb: color.rgb,
                property: color.property || 'color'
            }))
        })),
        rgbaColorGroups: rgbaGroups.map((group, index) => ({
            groupId: index + 1,
            colors: group.map(color => ({
                value: color.value,
                rgb: color.rgb,
                alpha: color.alpha || 1,
                property: color.property || 'color'
            }))
        })),
        files: results.map(r => ({
            file: r.file,
            hexCount: r.hexCount,
            rgbaCount: r.rgbaCount
        }))
    };
    
    // JSON 형식으로 콘솔 출력
    console.log('\n' + '='.repeat(60));
    console.log('📋 JSON 형식 출력');
    console.log('='.repeat(60));
    console.log(JSON.stringify(jsonData, null, 2));
    
    return jsonData;
}

// HTML 파일 생성
function generateHtml(jsonData) {
    const { summary, hexColorGroups, rgbaColorGroups } = jsonData;
    
    // Hex 그룹별 HTML 생성
    const hexGroupSections = hexColorGroups.map((group, groupIndex) => {
        const colorRows = group.colors.map((color, colorIndex) => {
            const bgColor = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            const brightness = color.rgb.r * 0.299 + color.rgb.g * 0.587 + color.rgb.b * 0.114;
            const textColor = brightness < 128 ? '#ffffff' : '#000000';
            
            return `
                <tr>
                    <td>${colorIndex + 1}</td>
                    <td class="color-cell" style="background-color: ${bgColor};">
                        <span style="color: ${textColor};">${color.value}</span>
                    </td>
                    <td>${color.value}</td>
                    <td>RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</td>
                    <td>${color.property || 'color'}</td>
                </tr>`;
        }).join('');
        
        return `
        <div class="group-section">
            <h2>Hex 그룹 ${groupIndex + 1} (${group.colors.length}개 색상)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 60px;">번호</th>
                        <th style="width: 200px;">컬러</th>
                        <th>Hex 값</th>
                        <th>RGB</th>
                        <th>CSS 속성</th>
                    </tr>
                </thead>
                <tbody>
                    ${colorRows}
                </tbody>
            </table>
        </div>`;
    }).join('');
    
    // RGBA 그룹별 HTML 생성
    const rgbaGroupSections = rgbaColorGroups.map((group, groupIndex) => {
        const colorRows = group.colors.map((color, colorIndex) => {
            const bgColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha || 1})`;
            const brightness = color.rgb.r * 0.299 + color.rgb.g * 0.587 + color.rgb.b * 0.114;
            const textColor = brightness < 128 ? '#ffffff' : '#000000';
            
            return `
                <tr>
                    <td>${colorIndex + 1}</td>
                    <td class="color-cell" style="background-color: ${bgColor};">
                        <span style="color: ${textColor};">${color.value}</span>
                    </td>
                    <td>${color.value}</td>
                    <td>RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</td>
                    <td>${color.alpha || 1}</td>
                    <td>${color.property || 'color'}</td>
                </tr>`;
        }).join('');
        
        return `
        <div class="group-section">
            <h2>RGBA 그룹 ${groupIndex + 1} (${group.colors.length}개 색상)</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 60px;">번호</th>
                        <th style="width: 200px;">컬러</th>
                        <th>RGBA 값</th>
                        <th>RGB</th>
                        <th>Alpha</th>
                        <th>CSS 속성</th>
                    </tr>
                </thead>
                <tbody>
                    ${colorRows}
                </tbody>
            </table>
        </div>`;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Color 속성 색상 추출 결과</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }
        
        .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 30px;
        }
        
        .summary p {
            margin: 5px 0;
            color: #495057;
        }
        
        h2 {
            font-size: 20px;
            margin: 30px 0 15px 0;
            color: #333;
            padding-bottom: 10px;
            border-bottom: 2px solid #dee2e6;
        }
        
        .group-section {
            margin-bottom: 40px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
            color: #495057;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .color-cell {
            width: 200px;
            text-align: center;
            font-weight: 600;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .color-cell span {
            padding: 4px 8px;
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
            backdrop-filter: blur(10px);
        }
        
        td:last-child {
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 CSS Color 속성 색상 추출 결과</h1>
        <div class="summary">
            <p><strong>처리된 파일 수:</strong> ${summary.totalFiles}개</p>
            <p><strong>Hex 색상 수:</strong> ${summary.totalHexColors}개 (그룹: ${summary.hexGroups}개)</p>
            <p><strong>RGBA 색상 수:</strong> ${summary.totalRgbaColors}개 (그룹: ${summary.rgbaGroups}개)</p>
            <p><strong>전체 색상 수:</strong> ${summary.totalColors}개</p>
        </div>
        ${hexGroupSections || '<p style="text-align: center; padding: 40px; color: #999;">추출된 Hex 색상이 없습니다.</p>'}
        ${rgbaGroupSections || '<p style="text-align: center; padding: 40px; color: #999;">추출된 RGBA 색상이 없습니다.</p>'}
    </div>
</body>
</html>`;
}

// HTML 파일 저장
function saveHtmlFile(jsonData, outputPath) {
    try {
        const htmlContent = generateHtml(jsonData);
        fs.writeFileSync(outputPath, htmlContent, 'utf8');
        console.log(`\n💾 HTML 파일이 저장되었습니다: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`\n❌ HTML 파일 저장 오류: ${error.message}`);
        return false;
    }
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('사용법: node font_color.js <css파일경로 또는 css폴더경로> [출력파일경로]');
        console.log('\n예시:');
        console.log('  node font_color.js html/solid2/page/input-f/css/style.css');
        console.log('  node font_color.js html/solid2/page/input-f/css');
        console.log('  node font_color.js html/solid2/page/input-f/css colors.html');
        process.exit(1);
    }
    
    const cssPath = args[0];
    const outputPath = args[1] || 'extracted-colors.html'; // 기본값: 현재 디렉토리에 저장
    
    console.log('🚀 CSS Color 속성 색상 추출 스크립트 시작\n');
    console.log(`📁 대상: ${cssPath}\n`);
    
    try {
        if (!fs.existsSync(cssPath)) {
            throw new Error(`파일 또는 폴더를 찾을 수 없습니다: ${cssPath}`);
        }
        
        const results = processCssFolder(cssPath);
        const jsonData = printResults(results);
        
        // HTML 파일 저장
        if (jsonData) {
            const absoluteOutputPath = path.isAbsolute(outputPath) 
                ? outputPath 
                : path.join(process.cwd(), outputPath);
            
            // 확장자가 없으면 .html 추가
            const finalOutputPath = outputPath.endsWith('.html') || outputPath.endsWith('.htm')
                ? absoluteOutputPath
                : absoluteOutputPath + '.html';
            
            saveHtmlFile(jsonData, finalOutputPath);
        }
        
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

main();
