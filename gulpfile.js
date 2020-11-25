'use strict';

var gulp = require('gulp'),
    file_system = require('fs'),
    config_file = './global_config.json',
    modules_config_file = '',
    sass = require('gulp-sass'),
    colorTerminal = require('colors'),
    path = require("path"),
    inquirer = require('inquirer'),
    isFolder = false,
    config_info = {},
    foldersRoutes = [];

const https = require('https');

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
                    messages('info', `La carpeta ${folders[element]['name']} ya existe`);
                  }
                catch (e){//Crear el folder
                    file_system.mkdirSync(folders[element]['name']);
                    if(file_system.existsSync(folders[element]['name'])) statusFolder.push(index);
                    messages('success', `La carpeta ${folders[element]['name']} se ha creado correctamente`);
                }
               

                if (file_system.existsSync(folders[element]['name'])) {
                    assetsFolder = folders[element]['name']+'/assets';
                    foldersRoutes.push(assetsFolder);

                    if(!file_system.existsSync(assetsFolder)) file_system.mkdirSync(assetsFolder);
                    if(folders[element]['assets'] != undefined){

                        Object.keys(folders[element]['assets']).forEach( (subElement, index ) => {
                            var subElementFolder = `${assetsFolder}/${subElement}`;
                            

                            if(!file_system.existsSync(subElementFolder)){
                                file_system.mkdirSync(subElementFolder);
                                messages('success', `La carpeta ${subElementFolder} se ha creado correctamente`);
                            }else{
                                messages('info', `La carpeta ${subElementFolder} ya existe`);
                            }
                            if(!file_system.existsSync(`${subElementFolder}/components`)) file_system.mkdirSync(`${subElementFolder}/components`);
                        })
                    }
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
    console.log(foldersRoutes[0],'modules_config_file');
    let devFolder = foldersRoutes[0];
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
                    Object.keys(json['moduls'][element]).forEach( (subElement, index, key) => {
                        let componentRoute = `${devFolder}/${key[index]}/components`,
                            fullComponentRoute = `${componentRoute}/${componentName}`,
                            urlFile = json['moduls'][element][subElement],
                            fileName = path.basename(urlFile),
                            fullFileRoute = `${fullComponentRoute}/${fileName}`;
                        
                            https.get(json['moduls'][element][subElement], response => {
                                    
                                if(!file_system.existsSync(fullFileRoute)) response.pipe(file_system.createWriteStream(fullFileRoute))
                                
                            }); 
                            if(!componentStatus) messages("success",`Se creo el componente ${componentName} con éxito`); componentStatus = true;
                       
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
if(!isFolder) principalFolders();


// gulp.task('components',async ()=>{
//     inquirer
//     .prompt([
//         {
//             type: 'checkbox',
//             message: 'Select components',
//             name: 'components',
//             choices: [
//                 {
//                 name: 'Custom Inputs',
//                 },
//                 {
//                 name: 'Sliders',
//                 },
//                 {
//                 name: 'Modals',
//                 }
//             ],
//             validate: function (answer) {
//                 if (answer.length < 1) {
//                 return 'You must choose at least one topping.';
//                 }

//                 return true;
//             },
//         },
//     ])
//     .then((answers) => {
//         console.log(JSON.stringify(answers, null, '  '));
//         modulesConfig();
//     });
    
// })
// //     sass.compiler = require('node-sass');

    gulp.task('sass',() =>{
        gulp.src('./src/**/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./css'));
    })

   gulp.task('sass:watch', () =>{
       gulp.watch('./src/**/*.scss',gulp.series(['sass']));
   })