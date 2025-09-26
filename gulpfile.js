const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const changed = require('gulp-changed').default;
const concat = require('gulp-concat');
const del = require('del');
const fs = require('fs');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');

// 환경 설정
const isDevelopment = process.env.NODE_ENV !== 'production';

// 경로 설정
/*
tokens json위치
scss scss 위치
cssDest scss 변환해서 css생기는 위치
minDest 미니파이(Minify)  위치
*/
const paths = {
  scss: './images/web/scss/**/*.scss',
  scssToSolid2: './images/web/scss/**/*.scss',
  solid2CssDest: './images/web/css/solid2',
  solid2MinDest: './images/web/css/solid2/minify',
  tokensCssFiles: [
    './images/web/tokens/css/common.css',
    './images/web/tokens/css/light-theme.css',
    './images/web/tokens/css/dark-theme.css',
    './images/web/tokens/css/normal-typo.css',
    './images/web/tokens/css/large-typo.css'
  ],
  variablesScss: './images/web/tokens/scss/_variables.scss',
  // 와치 최적화를 위한 제외 패턴
  watchIgnore: [
    '!./images/web/scss/**/_*.scss', // 파셜 파일 제외
    '!./images/web/scss/**/node_modules/**',
    '!./images/web/scss/**/.git/**'
  ]
};

// 디바운싱을 위한 타이머
let watchTimer = null;

// SCSS 파일들을 solid2 CSS 폴더로 컴파일하는 함수 (최적화됨)
function scssToSolid2CSS() {
  console.log('🔄 SCSS 컴파일을 시작합니다...');
  
  // solid2 폴더가 없으면 생성
  const solid2Dir = path.resolve(paths.solid2CssDest);
  if (!fs.existsSync(solid2Dir)) {
    fs.mkdirSync(solid2Dir, { recursive: true });
    console.log('📁 CSS 폴더를 생성했습니다:', solid2Dir);
  }
  
  // solid2 minify 폴더가 없으면 생성
  const solid2MinDir = path.resolve(paths.solid2MinDest);
  if (!fs.existsSync(solid2MinDir)) {
    fs.mkdirSync(solid2MinDir, { recursive: true });
    console.log('📁 Minify 폴더를 생성했습니다:', solid2MinDir);
  }
  
  let stream = gulp.src(paths.scssToSolid2)
    .pipe(plumber())
    .pipe(changed(paths.solid2CssDest));
  
  // 개발 환경에서만 소스맵 생성 (와치 모드 포함)
  if (isDevelopment) {
    stream = stream.pipe(sourcemaps.init());
  }
  
  stream = stream
    .pipe(sass({
      outputStyle: isDevelopment ? 'expanded' : 'compressed',
      precision: 10,
      includePaths: ['./images/web/tokens/scss'] // 변수 파일 경로 추가
    }).on('error', sass.logError));
  
  // 소스맵 쓰기 (개발 환경에서만)
  if (isDevelopment) {
    stream = stream.pipe(sourcemaps.write('.'));
  }
  
  stream = stream
    .pipe(gulp.dest(paths.solid2CssDest))
    .on('end', () => {
      console.log('✅ SCSS 컴파일이 완료되었습니다.');
    });
  
  // 프로덕션 빌드에서만 minify
  if (!isDevelopment) {
    stream = stream
      .pipe(cleanCSS({
        level: 2,
        format: 'beautify'
      }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.solid2MinDest))
      .on('end', () => {
        console.log('✅ Minify CSS 생성이 완료되었습니다.');
      });
  }
  
  return stream;
}

// tokens CSS 파일들을 읽어서 _variables.scss에 변수로 매칭하는 함수 (별도 실행용)
function tokensToVariables(done) {
  try {
    console.log('🔄 tokens CSS 파일들을 _variables.scss에 매칭합니다...');
    
    const variablesPath = paths.variablesScss;
    let allVariables = [];
    
    // 각 CSS 파일에서 변수 추출
    paths.tokensCssFiles.forEach(cssFile => {
      if (fs.existsSync(cssFile)) {
        const cssContent = fs.readFileSync(cssFile, 'utf8');
        const variables = extractVariablesFromCSS(cssContent);
        allVariables = allVariables.concat(variables);
        console.log(`📄 ${cssFile}에서 ${variables.length}개 변수 추출`);
      } else {
        console.log(`⚠️ ${cssFile} 파일을 찾을 수 없습니다.`);
      }
    });
    
    // 중복 제거 (같은 변수명이 여러 파일에 있을 수 있음)
    const uniqueVariables = allVariables.filter((variable, index, self) => 
      index === self.findIndex(v => v.name === variable.name)
    );
    
    console.log(`📊 총 ${uniqueVariables.length}개의 고유 변수를 찾았습니다.`);
    
    // _variables.scss 파일 생성/업데이트
    const updatedContent = generateVariablesScss(uniqueVariables);
    
    // 파일이 변경되었으면 저장
    let existingContent = '';
    if (fs.existsSync(variablesPath)) {
      existingContent = fs.readFileSync(variablesPath, 'utf8');
    }
    
    if (updatedContent !== existingContent) {
      fs.writeFileSync(variablesPath, updatedContent);
      console.log('✅ _variables.scss 파일이 업데이트되었습니다.');
    } else {
      console.log('ℹ️ _variables.scss 파일에 변경사항이 없습니다.');
    }
    
    if (typeof done === 'function') {
      done();
    }
  } catch (error) {
    console.error('❌ tokensToVariables 오류:', error);
    if (typeof done === 'function') {
      done(error);
    }
  }
}

// CSS에서 변수 추출하는 함수
function extractVariablesFromCSS(cssContent) {
  const variableRegex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g;
  const variables = [];
  let match;
  
  while ((match = variableRegex.exec(cssContent)) !== null) {
    const varName = match[1].trim();
    const varValue = match[2].trim();
    variables.push({ name: varName, value: varValue });
  }
  
  return variables;
}

// _variables.scss 파일을 생성하는 함수
function generateVariablesScss(variables) {
  const header = `// CSS 변수를 SCSS 변수로 변환
// 이 파일은 tokens/css 폴더의 CSS 파일들에서 자동으로 생성됩니다.
// 생성 시간: ${new Date().toLocaleString('ko-KR')}

`;

  // 변수들을 카테고리별로 분류
  const categories = {
    'Font Family': [],
    'Basic Colors': [],
    'Brand Colors': [],
    'Semantic Colors': [],
    'Typography': [],
    'Spacing': [],
    'Border Radius': [],
    'Shadow': [],
    'Animation': [],
    'Other': []
  };
  
  variables.forEach(variable => {
    const name = variable.name.toLowerCase();
    
    if (name.includes('font-family')) {
      categories['Font Family'].push(variable);
    } else if (name.includes('brand')) {
      categories['Brand Colors'].push(variable);
    } else if (name.includes('gray') || name.includes('white') || name.includes('black')) {
      categories['Basic Colors'].push(variable);
    } else if (name.includes('success') || name.includes('warning') || name.includes('error') || name.includes('info')) {
      categories['Semantic Colors'].push(variable);
    } else if (name.includes('font') || name.includes('text') || name.includes('line-height') || name.includes('letter-spacing')) {
      categories['Typography'].push(variable);
    } else if (name.includes('spacing') || name.includes('margin') || name.includes('padding')) {
      categories['Spacing'].push(variable);
    } else if (name.includes('radius') || name.includes('border')) {
      categories['Border Radius'].push(variable);
    } else if (name.includes('shadow')) {
      categories['Shadow'].push(variable);
    } else if (name.includes('duration') || name.includes('ease') || name.includes('transition')) {
      categories['Animation'].push(variable);
    } else {
      categories['Other'].push(variable);
    }
  });
  
  let content = header;
  
  // 각 카테고리별로 변수 생성
  Object.entries(categories).forEach(([categoryName, categoryVariables]) => {
    if (categoryVariables.length > 0) {
      content += `// ${categoryName}\n`;
      categoryVariables.forEach(variable => {
        const scssVarName = '$' + variable.name;
        content += `${scssVarName}: var(--${variable.name});\n`;
      });
      content += '\n';
    }
  });
  
  return content;
}

// SCSS 파일과 매칭되지 않는 CSS 파일들을 삭제하는 함수
function cleanUnmatchedCSS() {
  return new Promise((resolve, reject) => {
    try {
      const scssDir = './images/web/scss';
      const cssDir = './images/web/css/solid2';
      
      // SCSS 파일 목록 가져오기
      const scssFiles = fs.readdirSync(scssDir)
        .filter(file => file.endsWith('.scss') && !file.startsWith('_'))
        .map(file => file.replace('.scss', '.css'));
      
      // CSS 파일 목록 가져오기
      const cssFiles = fs.readdirSync(cssDir)
        .filter(file => file.endsWith('.css') && file !== 'tokens.css');
      
      // 매칭되지 않는 CSS 파일들 찾기
      const unmatchedFiles = cssFiles.filter(cssFile => !scssFiles.includes(cssFile));
      
      if (unmatchedFiles.length > 0) {
        console.log('🗑️  매칭되지 않는 CSS 파일들을 삭제합니다:', unmatchedFiles);
        
        // 매칭되지 않는 파일들 삭제
        const deletePromises = unmatchedFiles.map(async file => {
          const filePath = path.join(cssDir, file);
          const minFile = file.replace('.css', '.min.css');
          const minFilePath = path.join(cssDir, 'minify', minFile);
          
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`🗑️  삭제됨: ${filePath}`);
            }
            if (fs.existsSync(minFilePath)) {
              fs.unlinkSync(minFilePath);
              console.log(`🗑️  삭제됨: ${minFilePath}`);
            }
          } catch (error) {
            console.error(`❌ 삭제 실패: ${filePath}`, error);
          }
        });
        
        Promise.all(deletePromises)
          .then(() => {
            console.log('✅ 매칭되지 않는 CSS 파일들이 삭제되었습니다.');
            resolve();
          })
          .catch(reject);
      } else {
        console.log('ℹ️  삭제할 CSS 파일이 없습니다.');
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}


// 디바운싱된 컴파일 함수
function debouncedCompile() {
  if (watchTimer) {
    clearTimeout(watchTimer);
  }
  
  watchTimer = setTimeout(() => {
    console.log('🎨 SCSS 파일이 변경되었습니다. 컴파일 중...');
    scssToSolid2CSS();
  }, 300); // 300ms 디바운싱
}

// 최적화된 watch 함수
function watchFiles() {
  console.log('👀 파일 감시를 시작합니다...');
  
  // 와치 옵션 설정
  const watchOptions = {
    ignoreInitial: true, // 초기 실행 방지
    delay: 100, // 파일 변경 후 100ms 대기
    usePolling: false, // 폴링 비활성화 (성능 향상)
    interval: 1000, // 폴링 간격 (폴링 사용 시)
    binaryInterval: 1000,
    alwaysStat: false,
    depth: 10, // 하위 디렉토리 깊이 제한
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  };
  
  // SCSS 파일 변경 감시 (최적화됨)
  const scssWatcher = watch(paths.scssToSolid2, watchOptions, function(cb) {
    debouncedCompile();
    if (typeof cb === 'function') {
      cb();
    }
  });
  
  // 프로세스 종료 시 와처 정리
  process.on('SIGINT', () => {
    console.log('🛑 와치를 종료합니다...');
    if (scssWatcher && typeof scssWatcher.close === 'function') {
      scssWatcher.close();
    }
    if (watchTimer) {
      clearTimeout(watchTimer);
    }
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('🛑 와치를 종료합니다...');
    if (scssWatcher && typeof scssWatcher.close === 'function') {
      scssWatcher.close();
    }
    if (watchTimer) {
      clearTimeout(watchTimer);
    }
    process.exit(0);
  });
}

// 최적화된 빌드 함수
function optimizedBuild(done) {
  console.log('🚀 최적화된 빌드를 시작합니다...');
  return gulp.series(
    scssToSolid2CSS,
    cleanUnmatchedCSS
  )(done);
}

// 개발용 와치 함수 (소스맵 포함)
function devWatch(done) {
  console.log('🔧 개발 모드 와치를 시작합니다...');
  process.env.NODE_ENV = 'development';
  return gulp.series(
    scssToSolid2CSS,
    watchFiles
  )(done);
}

// 프로덕션 빌드 함수
function productionBuild(done) {
  console.log('🏭 프로덕션 빌드를 시작합니다...');
  process.env.NODE_ENV = 'production';
  return gulp.series(
    scssToSolid2CSS,
    cleanUnmatchedCSS
  )(done);
}

// task 등록
exports.scssToSolid2 = scssToSolid2CSS;
exports.tokensToVariables = tokensToVariables;
exports.cleanCSS = cleanUnmatchedCSS;
exports.build = optimizedBuild;
exports.dev = devWatch;
exports.prod = productionBuild;
exports.watch = gulp.series(scssToSolid2CSS, cleanUnmatchedCSS, watchFiles);
exports.default = optimizedBuild; 