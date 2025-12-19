const fs = require('fs');
const path = require('path');

// 이미지 확장자 목록
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff', 'tif'];

// CSS 파일에서 이미지 URL을 찾아서 -darkmode를 붙이는 함수
function processImageUrls(cssContent) {
    let modifiedContent = cssContent;
    let replacementCount = 0;

    // background 관련 속성에서 이미지 URL 찾기
    // url('image.jpg'), url("image.png"), url(image.svg) 등 모든 형식 지원
    const urlPattern = /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
    
    modifiedContent = modifiedContent.replace(urlPattern, (match, url) => {
        // URL에서 확장자 추출
        const urlTrimmed = url.trim();
        const extensionMatch = urlTrimmed.match(/\.([a-zA-Z0-9]+)(\?.*)?$/i);
        
        if (extensionMatch) {
            const extension = extensionMatch[1].toLowerCase();
            
            // 이미지 확장자인지 확인
            if (IMAGE_EXTENSIONS.includes(extension)) {
                // 이미 -darkmode가 붙어있는지 확인
                if (!urlTrimmed.includes('-darkmode.')) {
                    // 확장자 앞에 -darkmode 붙이기
                    const newUrl = urlTrimmed.replace(/\.([a-zA-Z0-9]+)(\?.*)?$/i, '-darkmode.$1$2');
                    
                    // 원래 따옴표 형식 유지
                    const quoteMatch = match.match(/url\s*\(\s*(['"])/);
                    const quote = quoteMatch ? quoteMatch[1] : '';
                    const closingQuote = quote;
                    
                    replacementCount++;
                    return `url(${quote}${newUrl}${closingQuote})`;
                }
            }
        }
        
        return match;
    });

    return { content: modifiedContent, count: replacementCount };
}

// CSS 파일에서 background 관련 속성 중 url()이 포함된 것이 있는지 확인하는 함수
function hasBackgroundProperties(cssContent) {
    // background 속성 중 url()이 포함된 것만 확인
    const urlPattern = /background[^;]*url\s*\(/gi;
    return urlPattern.test(cssContent);
}

// CSS 파일에서 background 관련 속성만 추출하는 함수
function extractBackgroundRules(cssContent) {
    const rules = [];
    
    // CSS 파싱 (간단한 버전)
    // 선택자와 속성 블록을 찾기
    const rulePattern = /([^{]+)\{([^}]+)\}/g;
    let match;
    
    while ((match = rulePattern.exec(cssContent)) !== null) {
        let selector = match[1].trim();
        const properties = match[2];
        
        // 주석 제거
        selector = selector.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '').trim();
        
        // 선택자가 비어있거나 주석만 있는 경우 건너뛰기
        if (!selector || selector.startsWith('/*') || !selector.match(/^[.#\[:a-zA-Z_-]/)) {
            continue;
        }
        
        // background 관련 속성 중 url()이 포함된 것이 있는지 확인
        if (hasBackgroundProperties(properties)) {
            // background 관련 속성 중 url()이 포함된 것만 추출
            const backgroundProps = properties
                .split(';')
                .filter(prop => {
                    const trimmed = prop.trim();
                    // background 속성이면서 url()이 포함된 것만
                    return /background/i.test(trimmed) && /url\s*\(/i.test(trimmed);
                })
                .join(';');
            
            if (backgroundProps.trim()) {
                // 선택자가 여러 개일 수 있으므로 쉼표로 분리
                const selectors = selector.split(',').map(s => s.trim()).filter(s => s && !s.startsWith('/*'));
                if (selectors.length > 0) {
                    // 원래 선택자 그대로 유지 (나중에 전체를 :root[data-theme="dark"]로 감쌀 예정)
                    const originalSelector = selectors.join(', ');
                    rules.push(`${originalSelector} {\n    ${backgroundProps};\n}`);
                }
            }
        }
    }
    
    return rules;
}

// CSS 폴더 내의 모든 CSS 파일 처리
function processCssFolder(cssFolderPath) {
    if (!fs.existsSync(cssFolderPath)) {
        throw new Error(`CSS 폴더를 찾을 수 없습니다: ${cssFolderPath}`);
    }
    
    // 재귀적으로 CSS 파일 찾기
    function findCssFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                findCssFiles(filePath, fileList);
            } else if (file.endsWith('.css') && !file.includes('_dark') && file !== 'dark.css') {
                fileList.push(filePath);
            }
        });
        
        return fileList;
    }
    
    const cssFiles = findCssFiles(cssFolderPath);
    
    if (cssFiles.length === 0) {
        console.log('⚠️  CSS 파일을 찾을 수 없습니다.');
        return;
    }
    
    console.log(`\n📁 ${cssFiles.length}개의 CSS 파일을 찾았습니다...\n`);
    
    let allDarkCss = [];
    let totalReplacements = 0;
    let processedFiles = 0;
    
    cssFiles.forEach(cssFile => {
        const relativePath = path.relative(cssFolderPath, cssFile);
        console.log(`📄 처리 중: ${relativePath}`);
        
        try {
            const cssContent = fs.readFileSync(cssFile, 'utf8');
            
            // background 관련 속성이 있는지 확인
            if (hasBackgroundProperties(cssContent)) {
                // background 관련 속성만 추출
                const backgroundRules = extractBackgroundRules(cssContent);
                
                if (backgroundRules.length > 0) {
                    // 이미지 URL에 _dark 붙이기
                    const processedRules = backgroundRules.map(rule => {
                        const { content, count } = processImageUrls(rule);
                        totalReplacements += count;
                        return content;
                    });
                    
                    // 파일 경로 주석 추가
                    allDarkCss.push(`/* ${relativePath} */`);
                    allDarkCss.push(...processedRules);
                    allDarkCss.push(''); // 빈 줄 추가
                    
                    processedFiles++;
                    console.log(`  ✅ ${backgroundRules.length}개 규칙 추출, ${totalReplacements}개 이미지 URL 수정\n`);
                } else {
                    console.log(`  ⚠️  background 속성을 찾았지만 추출할 규칙이 없습니다.\n`);
                }
            } else {
                console.log(`  ⚠️  background 관련 속성이 없습니다.\n`);
            }
        } catch (error) {
            console.error(`  ❌ 오류 발생: ${error.message}\n`);
        }
    });
    
    // dark.css 파일 생성
    if (allDarkCss.length > 0) {
        const darkCssPath = path.join(cssFolderPath, 'dark.css');
        // 전체 CSS를 :root[data-theme="dark"]로 한 번만 감싸기
        const darkCssContent = `:root[data-theme="dark"] {\n${allDarkCss.join('\n')}\n}`;
        
        fs.writeFileSync(darkCssPath, darkCssContent, 'utf8');
        
        console.log(`\n✨ dark.css 파일이 생성되었습니다: ${darkCssPath}`);
        console.log(`📊 처리된 파일: ${processedFiles}개`);
        console.log(`🖼️  수정된 이미지 URL: ${totalReplacements}개`);
    } else {
        console.log('\n⚠️  생성할 내용이 없습니다.');
    }
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('사용법: node bgch_dark.js <CSS폴더경로>');
        console.log('예시: node bgch_dark.js ./test-bg-css');
        process.exit(1);
    }
    
    const cssFolderPath = path.resolve(args[0]);
    
    console.log('🚀 CSS 파일 처리 시작...');
    console.log(`📂 대상 폴더: ${cssFolderPath}`);
    
    try {
        processCssFolder(cssFolderPath);
        console.log('\n✅ 처리가 완료되었습니다!');
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
    main();
}

module.exports = { processCssFolder, processImageUrls, extractBackgroundRules };

