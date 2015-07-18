var gulp = require('gulp');

var sass = require('gulp-ruby-sass');
var shell = require('gulp-shell');
var connect = require('gulp-connect');
var prefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var open = require('open');

var Wig = require('wig');

var paths = {
  sass: ['assets/sass/**/*.scss','assets/sass/**/*.sass'],
  wig:   ['templates/**/*', 'data/**/*']
}

var builder = new Wig({
  rootDir: __dirname,
  outDir: './public',
  verbose: true,
  renderer: 'nunjucks'
});

gulp.task('sass', function(){
  return sass('assets/sass',{
    style: 'compact',
    bundleExec: false,
    compass: false,
    sourcemap:false,
    loadPath: []
  })
  .on('error',function(err){
    console.error('Error',err.message,err);
  })
  .pipe(prefixer(['last 2 versions', '> 4%']))
  .on('error',function(err){
    console.error('Error',err.message,err);
  })
  .pipe(gulp.dest('public/assets/css'))
  .on('error',function(err){
    console.error('Error',err.message,err);
  })
});



gulp.task('wig', function() {
  try{
    builder.build();
  }catch(e){
    console.error(e);
  }
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.wig, ['wig']);
});

// test server(node)
gulp.task('server_node', function(){
  connect.server({
    root:'public',
    port:3000
  });
});


/* compile icons ============================================== */

var icon_paths = {
  src_dir: 'assets/icons',
  src: ['assets/icons/*.svg'],
  tmp: ['assets/icons_tmp/*.svg']
}
gulp.task('icon', shell.task([
  'fontcustom compile'
]));

gulp.task('icon_tmp',function(){
  gulp.src(icon_paths.tmp)
    .pipe(rename(function(path){
      path.basename = path.basename.replace(/limbic_iconsのコピー[_-]/,'');
    }))
    .pipe(gulp.dest(icon_paths.src_dir))
});

gulp.task('watch-icon',function(){
  gulp.watch(icon_paths.tmp, ['icon_tmp']);
  gulp.watch(icon_paths.src, ['icon']);
});



// test server(PHP)
gulp.task('server_php', shell.task([
  'php -S localhost:3000 -t public'
]));

// test server(Python)
gulp.task('server_py', shell.task([
  'pushd public; python -m SimpleHTTPServer 3000; popd'
]));

gulp.task('open', function(){
  open('http://localhost:3000');
});


gulp.task('default',['server_py','wig','sass','watch','open']);
gulp.task('full',['icon_tmp','icon','watch-icon','default']);
