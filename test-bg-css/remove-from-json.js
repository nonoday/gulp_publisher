const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 명령줄 인자에서 파일 경로 가져오기
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('사용법: node remove-from-json.js <json파일경로> <엑셀파일경로> [컬럼번호]');
    console.error('예시: node remove-from-json.js program.json paths.xlsx 1');
    console.error('컬럼번호는 선택사항이며, 기본값은 1번째 컬럼(A열)입니다.');
    process.exit(1);
}

const jsonFilePath = args[0];
const excelFilePath = args[1];
const columnIndex = args[2] ? parseInt(args[2]) - 1 : 0; // 엑셀 컬럼은 0부터 시작, 사용자는 1부터 입력

try {
    // JSON 파일 읽기
    console.log(`📖 JSON 파일 읽는 중: ${jsonFilePath}`);
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);

    if (!jsonData.PROGRAM_LIST || !Array.isArray(jsonData.PROGRAM_LIST)) {
        console.error('❌ JSON 파일에 PROGRAM_LIST 배열이 없습니다.');
        process.exit(1);
    }

    const originalCount = jsonData.PROGRAM_LIST.length;
    console.log(`   원본 항목 수: ${originalCount}개`);

    // 엑셀 파일 읽기
    console.log(`\n📊 엑셀 파일 읽는 중: ${excelFilePath}`);
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // 엑셀에서 경로 리스트 추출 (지정한 컬럼에서)
    const pathList = [];
    excelData.forEach((row, rowIndex) => {
        if (row[columnIndex] && typeof row[columnIndex] === 'string' && row[columnIndex].trim() !== '') {
            const path = row[columnIndex].trim();
            pathList.push(path);
        }
    });

    console.log(`   엑셀에서 추출한 경로 수: ${pathList.length}개`);
    if (pathList.length > 0) {
        console.log(`   예시 경로: ${pathList.slice(0, 3).join(', ')}${pathList.length > 3 ? '...' : ''}`);
    }

    // Set으로 변환하여 빠른 검색
    const pathSet = new Set(pathList);

    // PROGRAM_LIST에서 MOVE_URL이 엑셀 경로 리스트에 있는 항목 제거
    console.log(`\n🔍 일치하는 항목 검색 중...`);
    const filteredList = jsonData.PROGRAM_LIST.filter(item => {
        if (!item.MOVE_URL) {
            return true; // MOVE_URL이 없으면 유지
        }
        const moveUrl = item.MOVE_URL.trim();
        const shouldRemove = pathSet.has(moveUrl);
        if (shouldRemove) {
            console.log(`   삭제: ${moveUrl}`);
        }
        return !shouldRemove; // 일치하지 않으면 유지
    });

    const removedCount = originalCount - filteredList.length;
    console.log(`\n✅ 처리 완료:`);
    console.log(`   삭제된 항목: ${removedCount}개`);
    console.log(`   남은 항목: ${filteredList.length}개`);

    // JSON 파일 업데이트
    jsonData.PROGRAM_LIST = filteredList;
    const updatedJson = JSON.stringify(jsonData, null, 4);
    fs.writeFileSync(jsonFilePath, updatedJson, 'utf-8');

    console.log(`\n💾 JSON 파일이 업데이트되었습니다: ${jsonFilePath}`);

} catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.code === 'ENOENT') {
        console.error(`   파일을 찾을 수 없습니다: ${error.path}`);
    } else if (error instanceof SyntaxError) {
        console.error('   JSON 파일 형식이 올바르지 않습니다.');
    }
    process.exit(1);
}

