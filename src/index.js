(function () {
    var fs = require('fs'),
        path = require('path'),
        request = require('request'),
        options = require('minimist')(process.argv.slice(2));

    options.instance = "dev11936";
    options.username = "admin";
    options.password = "bissmillah";

    /*if (process.argv.length < 4) {
        console.log("Please enter {instance} {username} {password}");
        process.exit(1);
    }*/

    // var include = "sys_updated_by=admin",
    var include = "sys_scope%3D61bde7134fd122009d184a318110c761",
        requestsToMake = [
            {
                "type"  : "sys_script",
                "filter" : include, 
                "extension" : ".js"
            },
           /* {
                "type": "sys_script_include", 
                "filter" : include, 
                "extension" : ".js"
            },
            {
                "type": "sys_ui_script", 
                "filter" : include, 
                "extension" : ".js"
            }*/
        ];

    for (var req in requestsToMake) {
        if (requestsToMake.hasOwnProperty(req)) {
            var current = requestsToMake[req];
            makeRequest(current.type, current.filter, current.extension);
        }
    }

    /**
     * @description Main method - Makes HTTP Get Request to ServiceNow
     * @param  {string} scriptType A type of script in ServiceNow
     * @param  {string} include    A query to add to the HTTP Request
     * @param  {string} extension the file extension to give to the file
     */
    function makeRequest(scriptType, include, extension) {
        request.get('http://' + options.instance + '.service-now.com/api/now/table/' + 
            scriptType + '?JSON&sysparm_query=' + include,
            function(error, response, body) {
                try {
                    var data = JSON.parse(body);
                    var records = data.result;
                    for (var i = 0; i < records.length; i++) {
                        checkDirectory(records[i], scriptType, extension);
                    }            
                } catch (e) {
                    console.log('oops  -  ' + e)
                }
        }).auth(options.username, options.password, false);
    }

    function checkDirectory(record, scriptType, extension) {
        var directory = __dirname + "/" + scriptType;
        try {
            var stats = fs.lstatSync(directory);
            if (stats.isDirectory()){
                writeAFile(record, scriptType, extension);
            } 
        } catch (e) {
            fs.mkdirSync(__dirname + "/" + scriptType);
            writeAFile(record, scriptType, extension);
        }
    }

    /**
     *
     * @description Creates a javascript file using what was in the ServiceNow instance
     * @param  {object} record     an object containing information from a GlideRecord about a script
     * @param  {string} scriptType the type of script in ServiceNow
     * @param  {string} extension the file extension to give to the file
     */
    function writeAFile(record, scriptType, extension) {
        var html,
            heading = "<!doctype html><html lang='en'><head><title>" + 
            "Update Information About : " + record.name + " for Release " + 
            record.u_release_name + "</title><meta name='viewport' content='" + 
            "width=device-width, initial-scale=1'><link rel='stylesheet' type" +
            "='text/css' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/" + 
            "css/bootstrap.min.css'/></head><body><div class='container'>",
            footing = "</div><script src='https://maxcdn.bootstrapcdn.com/" + 
            "bootstrap/3.3.5/js/bootstrap.min.js'></script></body></html>";
        if (record.u_migration_plan) {
            html = heading + record.u_migration_plan + footing;
        }
        fs.writeFile(__dirname + "/" + scriptType + "/" + 
            cleanName(record.name) + extension, 
            (record.script || record.payload || html), function(err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    /**
     * @description  Makes a valid filename by removing whitespace and special characters
     * @param  {string} name The name of a script in the system
     * @return {string}      The name without whitespace and special characters
     */
    function cleanName(name) {
        return name.replace(/[^A-Z0-9]/ig, '');
    }

})();