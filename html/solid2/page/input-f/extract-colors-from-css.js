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

// Hex 컬러 값 추출 (정규식)
function extractHexColors(content) {
    // #으로 시작하는 hex 값 추출 (#ffffff, #fff, #FF5733 등)
    // 단어 경계를 사용하여 다른 문자와 섞이지 않도록 함
    const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g;
    const matches = content.match(hexPattern) || [];
    
    // 중복 제거 및 정렬
    const uniqueHex = [...new Set(matches)].sort();
    return uniqueHex;
}

// RGBA 컬러 값 추출 (정규식)
function extractRgbaColors(content) {
    // rgba로 시작하는 컬러 값 추출
    // rgba(0, 0, 0, 0.5), rgba(255,255,255,0.8) 등
    // 공백이 있을 수도 있고 없을 수도 있음
    const rgbaPattern = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/gi;
    const matches = content.match(rgbaPattern) || [];
    
    // 중복 제거 및 정렬 (대소문자 구분 없이)
    const uniqueRgba = [...new Set(matches.map(m => m.toLowerCase()))].sort();
    return uniqueRgba;
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
    
    // 전체 통계
    const allHex = new Set();
    const allRgba = new Set();
    
    results.forEach(result => {
        result.hex.forEach(hex => allHex.add(hex.toLowerCase()));
        result.rgba.forEach(rgba => allRgba.add(rgba.toLowerCase()));
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
            console.log(`   Hex 값: ${result.hex.join(', ')}`);
        }
        
        if (result.rgba.length > 0) {
            console.log(`   RGBA 값: ${result.rgba.join(', ')}`);
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
    
    // JSON 형식으로도 출력
    console.log('\n' + '='.repeat(60));
    console.log('📋 JSON 형식 출력');
    console.log('='.repeat(60));
    console.log(JSON.stringify({
        summary: {
            totalFiles: results.length,
            uniqueHexCount: allHex.size,
            uniqueRgbaCount: allRgba.size
        },
        uniqueHex: sortedHex,
        uniqueRgba: sortedRgba,
        files: results.map(r => ({
            file: r.file,
            hex: r.hex,
            rgba: r.rgba
        }))
    }, null, 2));
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('사용법: node extract-colors-from-css.js <css파일경로 또는 css폴더경로>');
        console.log('\n예시:');
        console.log('  node extract-colors-from-css.js html/solid2/page/input-f/css/style.css');
        console.log('  node extract-colors-from-css.js html/solid2/page/input-f/css');
        process.exit(1);
    }
    
    const cssPath = args[0];
    
    console.log('🚀 CSS 컬러 값 추출 스크립트 시작\n');
    console.log(`📁 대상: ${cssPath}\n`);
    
    try {
        if (!fs.existsSync(cssPath)) {
            throw new Error(`파일 또는 폴더를 찾을 수 없습니다: ${cssPath}`);
        }
        
        const results = processCssFolder(cssPath);
        printResults(results);
        
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

main();

