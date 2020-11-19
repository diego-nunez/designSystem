'use strict';

var gulp = require('gulp'),
    file_system = require('fs'),
    config_file = './global_config.json',
    sass = require('gulp-sass'),
    colorTerminal = require('colors'),
    inquirer = require('inquirer');

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

    consolelog(texto);
}


var principalFolders = function(){

    
    file_system.readFile( config_file, 'utf-8', (err, data) => {
        if (err) throw err;
        var config_info = JSON.parse(data);
        
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
                    Object.keys(folders[element]).forEach( (subElement, index ) => {
                        if(subElement != 'name'){
                            if(!file_system.existsSync(folders[element]['name']+'/'+subElement)) file_system.mkdirSync(folders[element]['name']+'/'+subElement);
                            messages('info', `La carpeta ${folders[element]['name']+'/'+subElement} ya existe`);
                        }
                    })
                }
                    
            })
            
        }
       
        try{
            createStructure();
        } catch(e){
            messages('error', e.answer)
        }
        
    });
}
principalFolders();

gulp.task('components',async ()=>{
    inquirer
    .prompt([
        {
            type: 'checkbox',
            message: 'Select components',
            name: 'components',
            choices: [
                {
                name: 'Custom Inputs',
                },
                {
                name: 'Sliders',
                },
                {
                name: 'Modals',
                }
            ],
            validate: function (answer) {
                if (answer.length < 1) {
                return 'You must choose at least one topping.';
                }

                return true;
            },
        },
    ])
    .then((answers) => {
        console.log(JSON.stringify(answers, null, '  '));
    });
    
})
// //     sass.compiler = require('node-sass');

// //     gulp.task('sass',() =>{
// //         gulp.src('./src/**/*.scss')
// //             .pipe(sass().on('error', sass.logError))
// //             .pipe(gulp.dest('./css'));
// //     })

// //    gulp.task('sass:watch', () =>{
// //        gulp.watch('./src/**/*.scss',gulp.series(['sass']));
// //    })