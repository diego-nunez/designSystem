'use strict';

var gulp = require('gulp'),
    pug = require('gulp-pug'),
    file_system = require('fs'),
    config_file = './global_config.json',
    modules_config_file = '',
    sass = require('gulp-sass'),
    colorTerminal = require('colors'),
    rename = require("gulp-rename"),
    path = require("path"),
    inquirer = require('inquirer'),
    isFolder = false,
    config_info = {},
    foldersRoutes = [],
    https = require('https'),
    browserSync = require('browser-sync').create(),
    browserify = require("browserify"),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    buffer = require("vinyl-buffer"),
    babel = require('babelify'),
    glob = require('glob'),
    merge = require('merge-stream'),
    uglify = require("gulp-uglify");

    sass.compiler = require('node-sass');

var messages = function(type,texto){
    
    const messageDetails = {
        'error':{
            'color':'red',
            'style':'bold',
            'console':console.warn
        },
        'success':{
            'color':'green',
            'style':'italic',
            'console':console.log
        },
        'info':{
            'color':'magenta',
            'style':'reset',
            'console': console.info
        }
    }

    let consolelog = messageDetails[type]['console'];
    colorTerminal.setTheme({
        custom: [messageDetails[type]['color'],messageDetails[type]['style']]
      });
    
    // no borrar
    consolelog(texto.custom);
}


var principalFolders = function(){

    
    file_system.readFile( config_file, 'utf-8', (err, data) => {
        if (err) throw err;
        var assetsFolder='';
            config_info = JSON.parse(data),
            modules_config_file = config_info.project.componentsConfig.config;
          
        var createStructure = function(){
            if(typeof config_info != 'object') throw "no es un Json"

            var project = config_info.project,
                folders = project.folders,
                statusFolder = [];
            
            Object.keys(folders).forEach( (element, index ) => {
                // se crean las carpetas
                
                try {
                    file_system.accessSync(folders[element]['name'], file_system.F_OK);
                    statusFolder.push(index);
                    // messages('info', `La carpeta ${folders[element]['name']} ya existe`);
                  }
                catch (e){//Crear el folder
                    file_system.mkdirSync(folders[element]['name']);
                    if(file_system.existsSync(folders[element]['name'])) statusFolder.push(index);
                    messages('success', `La carpeta ${folders[element]['name']} se ha creado correctamente`);
                }
               
                if (file_system.existsSync(folders[element]['name'])) {
                    
                    // console.log(foldersRoutes, Object.keys(folders[element]),"folders[element]['name']");
                    Object.keys(folders[element]).forEach((folder, index ) => {
                        if(folder != 'name'){
                            assetsFolder = `${folders[element]['name']}/${folder}`;
                             foldersRoutes.push(assetsFolder);

                            if(!file_system.existsSync(assetsFolder)) file_system.mkdirSync(assetsFolder);
                       
                            if(folders[element][folder] != undefined){
        
                                Object.keys(folders[element][folder]).forEach( (subElement, index ) => {
                                    var subElementFolder = `${assetsFolder}/${subElement}`;
                                    
                                    
                                    if(!file_system.existsSync(subElementFolder)){
                                        file_system.mkdirSync(subElementFolder);
                                        messages('success', `La carpeta ${subElementFolder} se ha creado correctamente`);
                                    }
                                    if(!file_system.existsSync(`${subElementFolder}/components`) && folder == 'assets') file_system.mkdirSync(`${subElementFolder}/components`);
                                })
                            }
                        }
                    })
                }
                    
            })
            
        }

        try{
            createStructure();
            isFolder = true;
            modulesConfig();
            
        } catch(e){
            messages('error', e.answer)
        }

       
    });
}

var modulesConfig = function(){
    let devFolder = foldersRoutes;
    https.get(modules_config_file,(res) => {
        let body = "";
    
        res.on("data", (chunk) => {
            body += chunk;
        });
    
        res.on("end", () => {
            try {
                let json = JSON.parse(body);
                
                Object.keys(json['moduls']).forEach( (element, index, key ) => {

                    let componentName = key[index],
                        componentStatus = false;
                        // console.log(json['moduls'][element],"json['moduls'][element]");
                    Object.keys(json['moduls'][element]).forEach( (subElement, index, key) => {
                        Object.keys(json['moduls'][element][subElement]).forEach( (moduleFile, index, key) => {
                            let urlFile = json['moduls'][element][subElement][moduleFile],
                                fileType = path.extname(urlFile).substr(1),
                                devFolderType = (fileType == 'pug')? devFolder[0]: `${devFolder[1]}/${fileType}`,
                                // parentFolder = (fileType == 'pug')? ``:`${key[index]}/`,
                                componentRoute = `${devFolderType}/components`,
                                fileName = path.basename(urlFile),
                                fullFileRoute = `${componentRoute}/${fileName}`;

                                https.get(urlFile, response => {
                                        
                                    if(!file_system.existsSync(fullFileRoute)) {
                                        response.pipe(file_system.createWriteStream(fullFileRoute));
                                        if(!componentStatus) messages("success",`Se creo el componente ${componentName} con éxito`); componentStatus = true;
                                        componentStatus = true;
                                    }
                                    
                                }); 
                                
                        })
                        
                       
                    })
                })
                
            } catch (error) {
                messages("error",error.message);
            };
        });
    
    }).on("error", (error) => {
        messages("error",error.message);
    });
    
}

//principalFolders();
function initProyect(done){
    principalFolders(); 
    done();
}

function reload() {
    browserSync.init({
      port: 3000,
      server:  './dist'
    });
  }
gulp.task('pug',function(){
    
    let isSuccess =  true;
    return (
        gulp.src(['src/pug/pages/*.pug','src/pug/*.pug'])
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dist'))
        .on('end', ()=> {
            browserSync.reload()
            if( isSuccess )
                messages("success",'pug is html now!')
        })
    )
})

gulp.task('js',function(){
    let isSuccess =  true,
        files = glob.sync('src/assets/js/controllers/*.js');
        return merge(files.map(function(file) {
            let entriesFiles = [file],
                defaultFile = (file == 'src/assets/js/controllers/default.controller.js')? entriesFiles.unshift(require.resolve('babel-polyfill')):'';
            
            return browserify({
                // entries: [ require.resolve('babel-polyfill'),file],
                entries: entriesFiles,
                debug: true
            }).transform(babel,{
                        ignore: [/\/node_modules\/(?!@vizuaalog\/)/],     
                        presets: [ 
                            "@babel/preset-env",
                            "@babel/preset-react"] 
              
                    })
                .bundle()
                .pipe(source(path.basename(file, '.js') + ".js"))
                .pipe(buffer())
	
                // And uglify
        
                // .pipe(uglify())
                .pipe(gulp.dest("dist/assets/js/controllers/"))
          }));
   
    // var bundler = watchify(browserify('src/assets/js/controllers/form.controller.js', {mode:'hash',resolve: ['path-reduce', 'strip-ext'], debug: true })
    //     .transform(babel,{
    //         ignore: [/\/node_modules\/(?!@vizuaalog\/)/],     
    //         presets: [ 
    //             "@babel/preset-env",
    //             "@babel/preset-react"] 
  
    //     }));
    // return (
    //     // gulp.src("src/assets/js/**/*")
    //     //     .pipe(babel({
    //     //         presets: ['env']
    //     //     }))
    //     //     .pipe(gulp.dest('./dist/assets/js'))
    //     //     .pipe(browserSync.stream())
    //     //     .on('error', err => {
    //     //         isSuccess = false;
    //     //         messages("error",err.formatted)
    //     //     })
    //     //     .on('end', ()=> {
    //     //         if( isSuccess )
    //     //             messages("success",'JS task complete')
    //     //     })
    //     // )
        
    //     bundler.bundle()
    //         .on('error', function(err) { console.error(err); this.emit('end'); })
    //         .pipe(source('form.controller.js'))
    //         // .pipe(buffer())
    //         .pipe(gulp.dest('./dist/'))
    // )
})

gulp.task('assets',function(){
    let isSuccess =  true;
    return (
        gulp.src(["src/assets/**","!src/assets/js/**/*", "!src/assets/scss/**/*"])
            .pipe(gulp.dest('./dist/assets/'))
            .pipe(browserSync.stream())
            .on('error', err => {
                isSuccess = false;
                messages("error",err.formatted)
            })
            .on('end', ()=> {
                if( isSuccess )
                    messages("success",'assets task complete')
            })
        )
})
// function views() {
//     return (
//       gulp.src('src/pug/pages/**/*.pug')
//       .pipe(pug({
//           pretty: true,
//           locals: configData
//       }))
//       .pipe(gulp.dest(configData.is_develop ? './local' : './dist'))
//       .on('end', browserSync.reload)
//     )
// }

gulp.task('sass',function() {
    let isSuccess =  true;
    return  gulp.src('./src/assets/scss/controllers/*.scss')
            .pipe(sass().on('error', err => {
                isSuccess = false;
                messages("error",err.formatted)
            }))
            .pipe(rename(function (path) {
                // Updates the object in-place
                path.dirname += "/assets/css/controllers";
                path.extname = ".css";
              }))
            .pipe(gulp.dest('dist/'))
            .on('end', ()=> {
                if( isSuccess )
                browserSync.reload()
                    messages("success",'Styles task complete')
            });
    
})
    // gulp.task('sass');
    // gulp.task('sass', function() {

    //     return gulp.src('./public_html/lib/sass/main.scss')
    //         .pipe(sass()).on("error", sass.logError)
    //         .pipe(gulp.dest('./public_html/css'))
    //         //.pipe(reload({ stream:true }));
    // });

function watchElements(done){
    gulp.watch('./src/assets/scss/**/*', gulp.series('sass'));
    gulp.watch('src/assets/js/**/*', gulp.series('js'));
    gulp.watch('./src/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('src/assets/**', gulp.series('assets'));
    browserSync.reload()
    done()
}

//gulp.task("watchElements", watchElements)
gulp.task("default", gulp.series(gulp.parallel(initProyect,'sass','pug','js','assets'),watchElements,reload))
// gulp.task("default", gulp.series(initProyect))
