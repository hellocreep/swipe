module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		bowerDir: 'bower_components',
		copy: {
			main: {
				files: [
					{expand: true, cwd: '<%= bowerDir %>/jquery/dist/', src: 'jquery.js', dest: 'js/libs/'},
					{expand: true, cwd: '<%= bowerDir %>/jquery-hammerjs/', src: 'jquery.hammer-full.js', dest: 'js/libs/'},
					{expand: true, cwd: '<%= bowerDir %>/normalize.css/', src: 'normalize.css', dest: 'css/'}
				]
			}
		},
		uglify:{
			options:{},
			build: {
				src: 'js/jquery.swipe.js',
				dest: 'js/jquery.swipe.min.js'
			}
		}	
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['copy', 'uglify']);
}