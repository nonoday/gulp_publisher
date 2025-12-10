/**
 * node extract-colors-from-css.js <css파일경로 또는 css폴더경로>
 * CSS 파일에서 Hex 및 RGBA 컬러 값 추출 스크립트
 * 
 * @description
 * CSS 파일 또는 폴더 내의 모든 CSS 파일에서 #으로 시작하는 hex 값과 
 * rgba로 시작하는 컬러 값을 추출하여 출력합니다.
 * 
 * @usage
 * node extract-colors-from-css.js <css파일경로 또는 css폴더경로>
 * 
 * @example
 * // 단일 CSS 파일에서 추출
 * node extract-colors-from-css.js html/solid2/page/input-f/css/style.css
 * 
 * // CSS 폴더 내의 모든 CSS 파일에서 추출 (하위 폴더 포함)
 * node extract-colors-from-css.js html/solid2/page/input-f/css
 * 
 * @param {string} css파일경로 또는 css폴더경로 - 추출할 CSS 파일 경로 또는 폴더 경로
 * 
 * @note
 * - Hex 값: #ffffff, #fff, #FF5733 등 모든 형식 추출
 * - RGBA 값: rgba(0, 0, 0, 0.5), rgba(255,255,255,0.8) 등 추출
 * - 중복된 값은 한 번만 출력됩니다.
 * - 결과는 JSON 형식과 텍스트 형식으로 출력됩니다.
 */

const fs = require('fs');
const path = require('path');

// 컬러 값이 사용된 속성 타입 추출
function getColorPropertyType(content, colorValue, position) {
    // 컬러 값 앞 200자 범위 내에서 속성 찾기
    const beforeText = content.substring(Math.max(0, position - 200), position).toLowerCase();
    
    // 속성 패턴 매칭
    if (/\b(border(?:-color|-top-color|-right-color|-bottom-color|-left-color)?)\s*[:=]/.test(beforeText)) {
        return 'border';
    }
    if (/\b(background(?:-color)?)\s*[:=]/.test(beforeText)) {
        return 'background';
    }
    if (/\bcolor\s*[:=]/.test(beforeText)) {
        return 'color';
    }
    if (/\b(box-shadow|text-shadow)\s*[:=]/.test(beforeText)) {
        return 'shadow';
    }
    if (/\boutline(?:-color)?\s*[:=]/.test(beforeText)) {
        return 'outline';
    }
    
    return 'unknown';
}

// Hex 컬러 값 추출 (속성 타입 포함)
function extractHexColors(content) {
    const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/gi;
    const colors = [];
    let match;
    
    while ((match = hexPattern.exec(content)) !== null) {
        const hex = match[0];
        const position = match.index;
        const propertyType = getColorPropertyType(content, hex, position);
        
        colors.push({
            value: hex,
            type: propertyType
        });
    }
    
    // 중복 제거 (값과 타입 조합으로)
    const uniqueColors = [];
    const seen = new Set();
    
    colors.forEach(color => {
        const key = `${color.value.toLowerCase()}_${color.type}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueColors.push(color);
        }
    });
    
    // 값으로 정렬
    uniqueColors.sort((a, b) => a.value.localeCompare(b.value));
    
    return uniqueColors;
}

// RGBA 컬러 값 추출 (속성 타입 포함)
function extractRgbaColors(content) {
    const rgbaPattern = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/gi;
    const colors = [];
    let match;
    
    while ((match = rgbaPattern.exec(content)) !== null) {
        const rgba = match[0].toLowerCase();
        const position = match.index;
        const propertyType = getColorPropertyType(content, rgba, position);
        
        colors.push({
            value: rgba,
            type: propertyType
        });
    }
    
    // 중복 제거 (값과 타입 조합으로)
    const uniqueColors = [];
    const seen = new Set();
    
    colors.forEach(color => {
        const key = `${color.value}_${color.type}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueColors.push(color);
        }
    });
    
    // 값으로 정렬
    uniqueColors.sort((a, b) => a.value.localeCompare(b.value));
    
    return uniqueColors;
}

// 단일 CSS 파일에서 컬러 추출
function extractColorsFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hexColors = extractHexColors(content);
        const rgbaColors = extractRgbaColors(content);
        
        return {
            file: filePath,
            hex: hexColors,
            rgba: rgbaColors,
            hexCount: hexColors.length,
            rgbaCount: rgbaColors.length
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
    
    // 전체 통계 (컬러 객체에서 값 추출)
    const allHex = new Set();
    const allRgba = new Set();
    
    results.forEach(result => {
        result.hex.forEach(color => allHex.add(color.value.toLowerCase()));
        result.rgba.forEach(color => allRgba.add(color.value.toLowerCase()));
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 추출 결과 요약');
    console.log('='.repeat(60));
    console.log(`\n📁 처리된 파일 수: ${results.length}개`);
    console.log(`🎨 전체 고유 Hex 값: ${allHex.size}개`);
    console.log(`🎨 전체 고유 RGBA 값: ${allRgba.size}개`);
    
    // 파일별 상세 정보
    console.log('\n' + '='.repeat(60));
    console.log('📄 파일별 상세 정보');
    console.log('='.repeat(60));
    
    results.forEach(result => {
        console.log(`\n📄 ${result.file}`);
        console.log(`   Hex: ${result.hexCount}개, RGBA: ${result.rgbaCount}개`);
        
        if (result.hex.length > 0) {
            const hexList = result.hex.map(c => `${c.value} (${c.type})`).join(', ');
            console.log(`   Hex 값: ${hexList}`);
        }
        
        if (result.rgba.length > 0) {
            const rgbaList = result.rgba.map(c => `${c.value} (${c.type})`).join(', ');
            console.log(`   RGBA 값: ${rgbaList}`);
        }
    });
    
    // 전체 고유 값 목록
    console.log('\n' + '='.repeat(60));
    console.log('🎨 전체 고유 Hex 값 목록');
    console.log('='.repeat(60));
    const sortedHex = Array.from(allHex).sort();
    sortedHex.forEach((hex, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${hex}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎨 전체 고유 RGBA 값 목록');
    console.log('='.repeat(60));
    const sortedRgba = Array.from(allRgba).sort();
    sortedRgba.forEach((rgba, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${rgba}`);
    });
    
    // JSON 데이터 생성 (전체 컬러 정보 포함)
    const allHexWithType = [];
    const allRgbaWithType = [];
    const hexMap = new Map();
    const rgbaMap = new Map();
    
    results.forEach(result => {
        result.hex.forEach(color => {
            const key = color.value.toLowerCase();
            if (!hexMap.has(key)) {
                hexMap.set(key, new Set());
            }
            hexMap.get(key).add(color.type);
        });
        result.rgba.forEach(color => {
            const key = color.value.toLowerCase();
            if (!rgbaMap.has(key)) {
                rgbaMap.set(key, new Set());
            }
            rgbaMap.get(key).add(color.type);
        });
    });
    
    hexMap.forEach((types, value) => {
        allHexWithType.push({
            value: value,
            types: Array.from(types)
        });
    });
    
    rgbaMap.forEach((types, value) => {
        allRgbaWithType.push({
            value: value,
            types: Array.from(types)
        });
    });
    
    allHexWithType.sort((a, b) => a.value.localeCompare(b.value));
    allRgbaWithType.sort((a, b) => a.value.localeCompare(b.value));
    
    const jsonData = {
        summary: {
            totalFiles: results.length,
            uniqueHexCount: allHex.size,
            uniqueRgbaCount: allRgba.size
        },
        uniqueHex: allHexWithType,
        uniqueRgba: allRgbaWithType,
        files: results.map(r => ({
            file: r.file,
            hex: r.hex,
            rgba: r.rgba
        }))
    };
    
    // JSON 형식으로 콘솔 출력
    console.log('\n' + '='.repeat(60));
    console.log('📋 JSON 형식 출력');
    console.log('='.repeat(60));
    console.log(JSON.stringify(jsonData, null, 2));
    
    return jsonData;
}

// Hex 값을 RGB로 변환 (시각화용)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGBA 값을 파싱 (시각화용)
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

// HTML 파일 생성
function generateHtml(jsonData) {
    const { summary, uniqueHex, uniqueRgba } = jsonData;
    
    // Hex 컬러 테이블 행 생성
    const hexRows = uniqueHex.map((colorObj, index) => {
        const hex = colorObj.value;
        const types = colorObj.types || [];
        const typeText = types.length > 0 ? types.join(', ') : 'unknown';
        const rgb = hexToRgb(hex);
        const bgColor = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex;
        const textColor = rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) < 128 ? '#ffffff' : '#000000';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td class="color-cell" style="background-color: ${bgColor};">
                    <span style="color: ${textColor};">${hex}</span>
                </td>
                <td>${hex}</td>
                <td>${typeText}</td>
            </tr>`;
    }).join('');
    
    // RGBA 컬러 테이블 행 생성
    const rgbaRows = uniqueRgba.map((colorObj, index) => {
        const rgba = colorObj.value;
        const types = colorObj.types || [];
        const typeText = types.length > 0 ? types.join(', ') : 'unknown';
        const parsed = parseRgba(rgba);
        const bgColor = parsed ? `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})` : rgba;
        const textColor = parsed && (parsed.r * 0.299 + parsed.g * 0.587 + parsed.b * 0.114) < 128 ? '#ffffff' : '#000000';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td class="color-cell" style="background-color: ${bgColor};">
                    <span style="color: ${textColor};">${rgba}</span>
                </td>
                <td>${rgba}</td>
                <td>${typeText}</td>
            </tr>`;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS 컬러 추출 결과</title>
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
            margin-bottom: 30px;
            color: #333;
        }
        
        h2 {
            font-size: 20px;
            margin: 30px 0 15px 0;
            color: #333;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
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
        <h1>🎨 CSS 컬러 추출 결과</h1>
        
        <h2>Hex 컬러 (${summary.uniqueHexCount}개)</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 60px;">번호</th>
                    <th style="width: 200px;">컬러</th>
                    <th>값</th>
                    <th>속성</th>
                </tr>
            </thead>
            <tbody>
                ${hexRows || '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">Hex 컬러가 없습니다.</td></tr>'}
            </tbody>
        </table>
        
        <h2>RGBA 컬러 (${summary.uniqueRgbaCount}개)</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 60px;">번호</th>
                    <th style="width: 200px;">컬러</th>
                    <th>값</th>
                    <th>속성</th>
                </tr>
            </thead>
            <tbody>
                ${rgbaRows || '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">RGBA 컬러가 없습니다.</td></tr>'}
            </tbody>
        </table>
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
        console.log('사용법: node extract-colors-from-css.js <css파일경로 또는 css폴더경로> [출력파일경로]');
        console.log('\n예시:');
        console.log('  node extract-colors-from-css.js html/solid2/page/input-f/css/style.css');
        console.log('  node extract-colors-from-css.js html/solid2/page/input-f/css');
        console.log('  node extract-colors-from-css.js html/solid2/page/input-f/css colors.html');
        process.exit(1);
    }
    
    const cssPath = args[0];
    const outputPath = args[1] || 'extracted-colors.html'; // 기본값: 현재 디렉토리에 저장
    
    console.log('🚀 CSS 컬러 값 추출 스크립트 시작\n');
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

