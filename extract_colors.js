const fs = require('fs');
const path = require('path');

// cheerio가 설치되어 있지 않으면 설치 안내
let cheerio;
try {
    cheerio = require('cheerio');
} catch (e) {
    console.error('❌ cheerio가 설치되어 있지 않습니다.');
    console.log('다음 명령어로 설치해주세요: npm install cheerio');
    process.exit(1);
}

// HTML 파일 경로를 인자로 받기
const htmlFilePath = process.argv[2];

if (!htmlFilePath) {
    console.error('❌ HTML 파일 경로를 입력해주세요.');
    console.log('사용법: node extract_colors.js <html파일경로>');
    process.exit(1);
}

// 파일 존재 확인
if (!fs.existsSync(htmlFilePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${htmlFilePath}`);
    process.exit(1);
}

try {
    // HTML 파일 읽기
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    
    // cheerio로 HTML 파싱
    const $ = cheerio.load(htmlContent);
    
    // table 안의 td.color-cell 안의 span 태그에서 색상 코드 추출
    const colorData = [];
    const seenColors = new Set(); // 중복 제거용
    
    $('table td.color-cell span').each(function() {
        const colorText = $(this).text().trim();
        
        // #으로 시작하는 hex 색상 코드인지 확인
        if (colorText.startsWith('#')) {
            // 중복 제거
            if (!seenColors.has(colorText)) {
                seenColors.add(colorText);
                colorData.push({
                    "hex": colorText,
                    "ch": ""
                });
            }
        }
    });
    
    // 결과 출력
    if (colorData.length === 0) {
        console.log('⚠️  추출된 색상이 없습니다.');
        console.log('HTML 파일에 table > td.color-cell > span 구조가 있는지 확인해주세요.');
    } else {
        // color_ccccccc.js 형식으로 출력
        let output = 'const colorData = [\n';
        colorData.forEach((item, index) => {
            output += '    {\n';
            output += `        "hex": "${item.hex}",\n`;
            output += `        "ch": "${item.ch}"\n`;
            output += '    }';
            if (index < colorData.length - 1) {
                output += ',';
            }
            output += '\n';
        });
        output += ']';
        
        console.log(output);
        
        // color_ccccccc.js 파일로 저장
        const outputPath = path.join(process.cwd(), 'color_ccccccc.js');
        fs.writeFileSync(outputPath, output, 'utf-8');
        console.error(`\n✅ ${colorData.length}개의 색상이 추출되어 color_ccccccc.js에 저장되었습니다.`);
    }
    
} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
}

