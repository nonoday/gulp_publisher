/**
 * node replace-hex-to-css-vars.js <css폴더경로>
 * Hex to CSS 변수 변환 스크립트
 * 
 * @description
 * 스크립트 내부의 colorData 배열에서 hex와 ch 매핑을 사용하여,
 * CSS 폴더 내의 모든 CSS 파일에서 hex 값을 var(--ch-토큰) 형식의 CSS 변수로 변환합니다.
 * 
 * @usage
 * node replace-hex-to-css-vars.js <css폴더경로>
 * 
 * @example
 * // input-f/css 폴더의 CSS 파일 변환
 * node replace-hex-to-css-vars.js html/solid2/page/input-f/css
 * 
 * // input-f 폴더 전체의 CSS 파일 변환 (하위 폴더 포함)
 * node replace-hex-to-css-vars.js html/solid2/page/input-f
 * 
 * @param {string} css폴더경로 - 변환할 CSS 파일들이 있는 폴더 경로 (하위 폴더 포함)
 * 
 * @note
 * - colorData 배열은 스크립트 내부에 정의되어 있습니다.
 * - colorData 배열 형식: { "hex": "#cd652c", "type": "border", "ch": "orange-800" }
 * - 변환 예시: #cd652c → var(--orange-800)
 * - 대소문자 구분 없이 hex 값을 매칭합니다 (#CD652C, #cd652c 모두 매칭)
 * - CSS 파일은 원본이 수정되므로 백업을 권장합니다.
 */

const fs = require('fs');
const path = require('path');

// colorData 배열 정의
const colorData = [
    {
        "hex": "#cd652c",
        "type": "border",
        "ch": "orange-800"
    },
    {
        "hex": "#ec7014",
        "type": "border",
        "ch": "orange-600"
    },
    {
        "hex": "#C19277",
        "type": "border",
        "ch": "orange-600"
    },
    {
        "hex": "#f59a57",
        "type": "border",
        "ch": "orange-600"
    },
    {
        "hex": "#BB813F",
        "type": "border",
        "ch": "yellow-800"
    },
    {
        "hex": "#d89240",
        "type": "border",
        "ch": "yellow-600"
    },
    {
        "hex": "#ffc756",
        "type": "border",
        "ch": "yellow-400"
    },
    {
        "hex": "#A0A672",
        "type": "border",
        "ch": "olive-500"
    },
    {
        "hex": "#82B166",
        "type": "border",
        "ch": "olive-600"
    },
    {
        "hex": "#00b87f",
        "type": "border",
        "ch": "green-600"
    },
    {
        "hex": "#66B6AF",
        "type": "border",
        "ch": "seafoam-600"
    },
    {
        "hex": "#3bbbbd",
        "type": "border",
        "ch": "seafoam-500"
    },
    {
        "hex": "#24cdac",
        "type": "border",
        "ch": "seafoam-500"
    },
    {
        "hex": "#98DAD2",
        "type": "border",
        "ch": "seafoam-500"
    },
    {
        "hex": "#66A6B6",
        "type": "border",
        "ch": "cyan-600"
    },
    {
        "hex": "#66A3CE",
        "type": "border",
        "ch": "cyan-600"
    },
    {
        "hex": "#32acd4",
        "type": "border",
        "ch": "cyan-600"
    },
    {
        "hex": "#3db3df",
        "type": "border",
        "ch": "cyan-600"
    },
    {
        "hex": "#1b65af",
        "type": "border",
        "ch": "cyan-900"
    },
    {
        "hex": "#2e79b9",
        "type": "border",
        "ch": "cyan-900"
    },
    {
        "hex": "#008bf7",
        "type": "border",
        "ch": "blue-700"
    },
    {
        "hex": "#5d97d3",
        "type": "border",
        "ch": "blue-700"
    },
    {
        "hex": "#569df4",
        "type": "border",
        "ch": "blue-700"
    },
    {
        "hex": "#7A9EC7",
        "type": "border",
        "ch": "blue-400"
    },
    {
        "hex": "#64aeea",
        "type": "border",
        "ch": "blue-400"
    },
    {
        "hex": "#92ade3",
        "type": "border",
        "ch": "blue-400"
    },
    {
        "hex": "#8bb4ea",
        "type": "border",
        "ch": "blue-400"
    },
    {
        "hex": "#c4d4ef",
        "type": "border",
        "ch": "blue-300"
    },
    {
        "hex": "#d2d5d9",
        "type": "border",
        "ch": "monotone-200"
    },
    {
        "hex": "#dadfe4",
        "type": "border",
        "ch": "monotone-200"
    },
    {
        "hex": "#1826c3",
        "type": "border",
        "ch": "brand-700"
    },
    {
        "hex": "#8C9CD3",
        "type": "border",
        "ch": "brand-300"
    },
    {
        "hex": "#839DDC",
        "type": "border",
        "ch": "brand-300"
    },
    {
        "hex": "#97A9DE",
        "type": "border",
        "ch": "brand-300"
    },
    {
        "hex": "#b5bade",
        "type": "border",
        "ch": "brand-300"
    },
    {
        "hex": "#bbbfe3",
        "type": "border",
        "ch": "brand-300"
    },
    {
        "hex": "#E5E7EC",
        "type": "border",
        "ch": "monotone-200"
    },
    {
        "hex": "#e5e7ec",
        "type": "border",
        "ch": "monotone-200"
    },
    {
        "hex": "#EAEBF3",
        "type": "border",
        "ch": "monotone-100"
    },
    {
        "hex": "#7c6fe4",
        "type": "border",
        "ch": "purple-800"
    },
    {
        "hex": "#a181f7",
        "type": "border",
        "ch": "purple-800"
    },
    {
        "hex": "#ddd9ff",
        "type": "border",
        "ch": "purple-300"
    },
    {
        "hex": "#B887DE",
        "type": "border",
        "ch": "purple-500"
    },
    {
        "hex": "#B08ECB",
        "type": "border",
        "ch": "purple-500"
    },
    {
        "hex": "#CB87B2",
        "type": "border",
        "ch": "magenta-700"
    },
    {
        "hex": "#E255E2",
        "type": "border",
        "ch": "magenta-700"
    },
    {
        "hex": "#E255E2",
        "type": "border",
        "ch": "magenta-700"
    }
];

// colorData 배열에서 hex -> ch 매핑 생성
function extractColorData() {
    const colorMap = new Map();
    
    colorData.forEach(item => {
        const hex = item.hex.toLowerCase();
        const ch = item.ch;
        colorMap.set(hex, ch);
    });
    
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
    
    if (args.length < 1) {
        console.log('사용법: node replace-hex-to-css-vars.js <css폴더경로>');
        console.log('예시: node replace-hex-to-css-vars.js html/solid2/page/input-f/css');
        process.exit(1);
    }
    
    const cssFolderPath = args[0];
    
    console.log('🚀 Hex to CSS 변수 변환 스크립트 시작\n');
    console.log(`📁 CSS 폴더: ${cssFolderPath}\n`);
    
    try {
        // colorData 추출
        console.log('📊 colorData 추출 중...');
        const colorMap = extractColorData();
        console.log(`✅ ${colorMap.size}개의 색상 매핑을 찾았습니다.\n`);
        
        // CSS 파일 처리
        processCssFolder(cssFolderPath, colorMap);
        
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

main();

