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

// 경로 설정
/*
tokens json위치
scss scss 위치
cssDest scss 변환해서 css생기는 위치
minDest 미니파이(Minify)  위치
*/
const paths = {
  tokens: './images/web/tokens/**/*.json',
  scss: './images/web/scss/**/*.scss',
  scssToSolid2: './images/web/scss/**/*.scss',
  solid2CssDest: './images/web/css/solid2',
  solid2MinDest: './images/web/css/solid2/minify',
  tokensCss: './images/web/tokens/css/**/*.css',
  variablesScss: './images/web/tokens/scss/_variables.scss',
  tokensCssFiles: [
    './images/web/tokens/css/common.css',
    './images/web/tokens/css/light-theme.css',
    './images/web/tokens/css/dark-theme.css',
    './images/web/tokens/css/normal-typo.css',
    './images/web/tokens/css/large-typo.css'
  ],
  tokensCombinedDest: './images/web/css/solid2',
};

// tokens → CSS 빌드 (비동기)
function tokensToCSS(done) {
  try {
    // buildTokens 함수가 없으므로 빈 함수로 처리
    console.log('tokensToCSS 실행됨');
    if (typeof done === 'function') {
      done();
    }
  } catch (error) {
    if (typeof done === 'function') {
      done(error);
    }
  }
}





// SCSS 파일들을 solid2 CSS 폴더로 컴파일하는 함수
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
  
  return gulp.src(paths.scssToSolid2)
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.solid2CssDest))
    .on('end', () => {
      console.log('✅ SCSS 컴파일이 완료되었습니다.');
    })
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.solid2MinDest))
    .on('end', () => {
      console.log('✅ Minify CSS 생성이 완료되었습니다.');
    });
}

// _variables.scss를 CSS로 변환하는 함수
function variablesToCSS() {
  // solid2 폴더가 없으면 생성
  const solid2Dir = path.resolve(paths.solid2CssDest);
  if (!fs.existsSync(solid2Dir)) {
    fs.mkdirSync(solid2Dir, { recursive: true });
  }
  
  // solid2 minify 폴더가 없으면 생성
  const solid2MinDir = path.resolve(paths.solid2MinDest);
  if (!fs.existsSync(solid2MinDir)) {
    fs.mkdirSync(solid2MinDir, { recursive: true });
  }
  
  return gulp.src(paths.variablesScss)
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({ basename: 'variables' })) // 파일명을 variables.css로 변경
    .pipe(gulp.dest(paths.solid2CssDest))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.solid2MinDest));
}

// tokens CSS 파일들을 하나로 합치는 함수
function combineTokensCSS() {
  // CSS 폴더가 없으면 생성
  const cssDir = path.resolve(paths.tokensCombinedDest);
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  // minify 폴더가 없으면 생성
  const minifyDir = path.resolve(paths.tokensCombinedDest + '/minify');
  if (!fs.existsSync(minifyDir)) {
    fs.mkdirSync(minifyDir, { recursive: true });
  }
  
  return gulp.src(paths.tokensCssFiles)
    .pipe(plumber())
    .pipe(concat('tokens.css'))
    .pipe(gulp.dest(paths.tokensCombinedDest))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.tokensCombinedDest + '/minify'));
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

// common.css와 normal-typo.css를 체크해서 _variables.scss에 매칭하는 함수
function checkCssToVariables(done) {
  try {
    const variablesPath = './images/web/tokens/scss/_variables.scss';
    const commonCssPath = './images/web/tokens/css/common.css';
    const normalTypoCssPath = './images/web/tokens/css/normal-typo.css';
    
    // CSS 파일들이 존재하는지 확인
    if (!fs.existsSync(commonCssPath)) {
      console.log('⚠️ common.css 파일을 찾을 수 없습니다.');
      if (typeof done === 'function') {
        done();
      }
      return;
    }
    
    if (!fs.existsSync(normalTypoCssPath)) {
      console.log('⚠️ normal-typo.css 파일을 찾을 수 없습니다.');
      if (typeof done === 'function') {
        done();
      }
      return;
    }
    
    // CSS 파일들 읽기
    const commonCssContent = fs.readFileSync(commonCssPath, 'utf8');
    const normalTypoCssContent = fs.readFileSync(normalTypoCssPath, 'utf8');
    
    // CSS 변수들 추출
    const commonVariables = extractVariablesFromCSS(commonCssContent);
    const normalTypoVariables = extractVariablesFromCSS(normalTypoCssContent);
    
    // _variables.scss 파일 읽기
    let variablesContent = '';
    if (fs.existsSync(variablesPath)) {
      variablesContent = fs.readFileSync(variablesPath, 'utf8');
    }
    
    // 매칭 체크 및 업데이트
    const updatedContent = updateVariablesFile(variablesContent, commonVariables, normalTypoVariables);
    
    // 파일이 변경되었으면 저장
    if (updatedContent !== variablesContent) {
      fs.writeFileSync(variablesPath, updatedContent);
      console.log('✅ _variables.scss 파일이 업데이트되었습니다.');
    } else {
      console.log('ℹ️ _variables.scss 파일에 변경사항이 없습니다.');
    }
    
    if (typeof done === 'function') {
      done();
    }
  } catch (error) {
    console.error('❌ checkCssToVariables 오류:', error);
    if (typeof done === 'function') {
      done(error);
    }
  }
}

// CSS에서 변수 추출하는 함수
function extractVariablesFromCSS(cssContent) {
  const variableRegex = /--([^:]+):\s*([^;]+);/g;
  const variables = [];
  let match;
  
  while ((match = variableRegex.exec(cssContent)) !== null) {
    const varName = match[1].trim();
    const varValue = match[2].trim();
    variables.push({ name: varName, value: varValue });
  }
  
  return variables;
}

// _variables.scss 파일을 업데이트하는 함수
function updateVariablesFile(existingContent, commonVariables, normalTypoVariables) {
  let content = existingContent;
  
  // 기존 변수들을 파싱해서 맵으로 만들기
  const existingVars = new Map();
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^\$([^:]+):\s*var\(--([^)]+)\);/);
    if (match) {
      const scssVarName = match[1];
      const cssVarName = match[2];
      existingVars.set(cssVarName, { scssName: scssVarName, line: line });
    }
  });
  
  // 새로운 변수들 추가
  const allNewVariables = [...commonVariables, ...normalTypoVariables];
  const newVariables = [];
  
  allNewVariables.forEach(variable => {
    if (!existingVars.has(variable.name)) {
      const scssVarName = '$' + variable.name;
      newVariables.push(`${scssVarName}: var(--${variable.name});`);
    }
  });
  
  // 새로운 변수들이 있으면 추가
  if (newVariables.length > 0) {
    const header = '// CSS 변수를 SCSS 변수로 변환\n// 이 파일은 tokens/css 폴더의 CSS 파일들에서 자동으로 생성됩니다.\n\n';
    
    if (!content.includes(header)) {
      content = header + content;
    }
    
    content += '\n' + newVariables.join('\n') + '\n';
  }
  
  return content;
}

// watch
function watchFiles() {
  console.log('👀 파일 감시를 시작합니다...');
  
  // 토큰 파일 변경 감시 (더 안정적인 감시)
  watch(paths.tokens, { ignoreInitial: false }, function(cb) {
    console.log('📝 토큰 파일이 변경되었습니다.');
    tokensToCSS(cb);
  });
  
  // SCSS 파일 변경 감시 (solid2 CSS 폴더로 컴파일)
  watch(paths.scssToSolid2, { ignoreInitial: false }, function(cb) {
    console.log('🎨 SCSS 파일이 변경되었습니다. 컴파일 중...');
    scssToSolid2CSS();
    if (typeof cb === 'function') {
      cb();
    }
  });
  
  // _variables.scss 파일 변경 감시
  watch(paths.variablesScss, { ignoreInitial: false }, function(cb) {
    console.log('🔧 변수 파일이 변경되었습니다.');
    variablesToCSS();
    if (typeof cb === 'function') {
      cb();
    }
  });
  
  // CSS 파일 변경 감시 (common.css, normal-typo.css)
  watch(['./images/web/tokens/css/common.css', './images/web/tokens/css/normal-typo.css'], { ignoreInitial: false }, function(cb) {
    console.log('📋 CSS 파일이 변경되었습니다.');
    checkCssToVariables();
    if (typeof cb === 'function') {
      cb();
    }
  });
  
  // tokens CSS 파일들 변경 감시 (합치기)
  watch(paths.tokensCssFiles, { ignoreInitial: false }, function(cb) {
    console.log('🔗 토큰 CSS 파일이 변경되었습니다.');
    combineTokensCSS();
    if (typeof cb === 'function') {
      cb();
    }
  });
}

// task 등록
exports.tokens = tokensToCSS;
exports.scssToSolid2 = scssToSolid2CSS;
exports.variables = variablesToCSS;
exports.checkCss = checkCssToVariables;
exports.combineTokens = combineTokensCSS;
exports.cleanCSS = cleanUnmatchedCSS;
exports.watch = gulp.series(tokensToCSS, checkCssToVariables, scssToSolid2CSS, variablesToCSS, combineTokensCSS, cleanUnmatchedCSS, watchFiles);
exports.default = gulp.series(tokensToCSS, checkCssToVariables, scssToSolid2CSS, variablesToCSS, combineTokensCSS, cleanUnmatchedCSS); 