/**
 * Hex to CSS 변수 변환 스크립트
 * 
 * @description
 * color_chage.html 파일의 colorData 배열에서 hex와 ch 매핑을 추출하여,
 * CSS 폴더 내의 모든 CSS 파일에서 hex 값을 var(--ch-토큰) 형식의 CSS 변수로 변환합니다.
 * 
 * @usage
 * node replace-hex-to-css-vars.js <html파일경로> <css폴더경로>
 * 
 * @example
 * // input-f/css 폴더의 CSS 파일 변환
 * node replace-hex-to-css-vars.js html/solid2/page/input-f/color_chage.html html/solid2/page/input-f/css
 * 
 * // input-f 폴더 전체의 CSS 파일 변환 (하위 폴더 포함)
 * node replace-hex-to-css-vars.js html/solid2/page/input-f/color_chage.html html/solid2/page/input-f
 * 
 * @param {string} html파일경로 - colorData 배열이 포함된 HTML 파일 경로
 * @param {string} css폴더경로 - 변환할 CSS 파일들이 있는 폴더 경로 (하위 폴더 포함)
 * 
 * @note
 * - HTML 파일의 colorData 배열 형식: { "hex": "#cd652c", "type": "border", "ch": "orange-800" }
 * - 변환 예시: #cd652c → var(--orange-800)
 * - 대소문자 구분 없이 hex 값을 매칭합니다 (#CD652C, #cd652c 모두 매칭)
 * - CSS 파일은 원본이 수정되므로 백업을 권장합니다.
 */

const fs = require('fs');
const path = require('path');

// color_chage.html 파일에서 colorData 추출
function extractColorData(htmlFilePath) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // colorData 배열 부분 추출
    const match = htmlContent.match(/const\s+colorData\s*=\s*\[([\s\S]*?)\];/);
    if (!match) {
        throw new Error('colorData 배열을 찾을 수 없습니다.');
    }
    
    // JSON 파싱을 위해 배열 부분만 추출
    const arrayContent = match[1];
    
    // 각 객체를 개별적으로 파싱하여 hex -> ch 매핑 생성
    const colorMap = new Map();
    
    // 객체 패턴: { "hex": "...", "type": "...", "ch" : "..." } (공백 허용)
    // 더 유연한 패턴으로 여러 줄에 걸친 객체도 매칭
    const objectPattern = /\{\s*"hex"\s*:\s*"([^"]+)"[^}]*?"ch"\s*:\s*"([^"]+)"[^}]*?\}/gs;
    let objectMatch;
    
    while ((objectMatch = objectPattern.exec(arrayContent)) !== null) {
        const hex = objectMatch[1].toLowerCase();
        const ch = objectMatch[2];
        colorMap.set(hex, ch);
    }
    
    if (colorMap.size === 0) {
        throw new Error('colorData에서 색상 매핑을 찾을 수 없습니다.');
    }
    
    return colorMap;
}

// CSS 파일에서 hex 값을 var(--ch-토큰)으로 변경
function replaceHexInCss(cssContent, colorMap) {
    let modifiedContent = cssContent;
    let replacementCount = 0;
    
    // 각 hex 값에 대해 대소문자 구분 없이 매칭하여 교체
    colorMap.forEach((ch, hex) => {
        // 정규식으로 hex 값 찾기 (대소문자 구분 없이)
        // #cd652c, #CD652C, #Cd652C 등 모든 경우 매칭
        const regex = new RegExp(`#${hex.replace('#', '')}`, 'gi');
        const matches = modifiedContent.match(regex);
        
        if (matches) {
            modifiedContent = modifiedContent.replace(regex, `var(--${ch})`);
            replacementCount += matches.length;
            console.log(`  ✓ ${hex} → var(--${ch}) (${matches.length}개 교체)`);
        }
    });
    
    return { content: modifiedContent, count: replacementCount };
}

// CSS 폴더 내의 모든 CSS 파일 처리
function processCssFolder(cssFolderPath, colorMap) {
    if (!fs.existsSync(cssFolderPath)) {
        throw new Error(`CSS 폴더를 찾을 수 없습니다: ${cssFolderPath}`);
    }
    
    const files = fs.readdirSync(cssFolderPath, { recursive: true });
    const cssFiles = files.filter(file => 
        file.endsWith('.css') && 
        fs.statSync(path.join(cssFolderPath, file)).isFile()
    );
    
    if (cssFiles.length === 0) {
        console.log('⚠️  CSS 파일을 찾을 수 없습니다.');
        return;
    }
    
    console.log(`\n📁 ${cssFiles.length}개의 CSS 파일을 처리합니다...\n`);
    
    let totalReplacements = 0;
    
    cssFiles.forEach(cssFile => {
        const filePath = path.join(cssFolderPath, cssFile);
        console.log(`📄 처리 중: ${cssFile}`);
        
        try {
            const cssContent = fs.readFileSync(filePath, 'utf8');
            const { content: modifiedContent, count } = replaceHexInCss(cssContent, colorMap);
            
            if (count > 0) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`  ✅ ${count}개 교체 완료\n`);
                totalReplacements += count;
            } else {
                console.log(`  ⚠️  교체할 hex 값을 찾지 못했습니다.\n`);
            }
        } catch (error) {
            console.error(`  ❌ 오류 발생: ${error.message}\n`);
        }
    });
    
    console.log(`\n✨ 총 ${totalReplacements}개의 hex 값이 CSS 변수로 교체되었습니다.`);
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('사용법: node replace-hex-to-css-vars.js <html파일경로> <css폴더경로>');
        console.log('예시: node replace-hex-to-css-vars.js html/solid2/page/input-f/color_chage.html html/solid2/page/input-f');
        process.exit(1);
    }
    
    const htmlFilePath = args[0];
    const cssFolderPath = args[1];
    
    console.log('🚀 Hex to CSS 변수 변환 스크립트 시작\n');
    console.log(`📄 HTML 파일: ${htmlFilePath}`);
    console.log(`📁 CSS 폴더: ${cssFolderPath}\n`);
    
    try {
        // colorData 추출
        console.log('📊 colorData 추출 중...');
        const colorMap = extractColorData(htmlFilePath);
        console.log(`✅ ${colorMap.size}개의 색상 매핑을 찾았습니다.\n`);
        
        // CSS 파일 처리
        processCssFolder(cssFolderPath, colorMap);
        
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

main();

