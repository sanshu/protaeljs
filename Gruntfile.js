/*
 * Copyright 2014 msedova.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["build/", "dist/"],
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %>\n<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.<%= pkg.version %>.min.js'
            }
        },
        jsdoc : {
            main : {
                src: ['src/*.js', 'test/*.js'],
                options: {
                    destination: 'doc',
                    configure : "./conf/jsdoc.conf.json",
                    template : "./node_modules/grunt-jsdoc/node_modules/ink-docstrap/template"
                }
            }
        },
        // make a zipfile for "download" link
        compress: {
            main: {
                options: {
                    archive: 'dist/Protael.zip'
                },
                files: [
                    {expand: true, src: ['*'], cwd: 'build', dest: '<%= pkg.name %>/js'}, // minified js
                    {expand: true, src: ['*'], cwd: 'lib', dest: '<%= pkg.name %>/js/vendor'}, // js libraries
                    {expand: true, src: ['protael.css'], cwd: 'css', dest: '<%= pkg.name %>/css', filter: 'isFile'}, // css
                    {src: ['./protaelSeed.html'], dest: '<%= pkg.name %>/'} // template
                ]
            }
        },
        copy: {
            main: {
                files: [{expand: true,
                        cwd: 'src/',
                        src: '<%= pkg.name %>.js',
                        dest: 'dist/',
                        flatten: true,
                        filter: 'isFile'
                    },{expand: true,
                        cwd: 'build/',
                        src: '*.js',
                        dest: 'dist/',
                        flatten: true,
                        filter: 'isFile'
                    },{expand: true,
                        cwd: 'css/',
                        src: '*.css',
                        dest: 'dist/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'jsdoc','uglify', 'compress', 'copy']);
};
