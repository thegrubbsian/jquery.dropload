jQuery.dropload allows for drag-n-drop file uploading from browsers that support the HTML5 
drag-n-drop API and the HTML5 File API - currently that means FireFox 3.6, Chrome and Safari 5.

Usage
-----
Example:

	$("#someDiv").dropload({
		url: "/some/url/to/upload",
		data: { any: "extra", data: "you", want: "to pass" },
        paramName: "postedfile",
		maxFileSize: 1,
		error: function(err) {
			if (err == "notSupported") {
				alert("Unfortunately, your browser does not support the HTML5 File API.");
			} else if (err == "fileToLarge") {
				alert("Sorry, that file is too large.  Please limit uploads to 1Mb.");
			}
		},
		completed: function(status, resp) {
		    if (status == 403) {
		        alert(resp);
		    }
		}
    });

As you can see it's pretty simple to set up.  The plugin assumes that it will only bind to one
element on the page so errors may occur if more than one element match the initial selector.  The
options are pretty straightforward:

- url: The address where you want the form to be posted
- data: Any additional data you'd like to send with the file
- paramName: This will be the parameter name in the post data and will likely be how you'll
access the file data on the server
- maxFileSize: the file size limit in megabytes, defaults to 1
- erorr: This callback will be called if either the browser does not support the HTML5 File API
or if the file size exceeds the limit set.  The 'err' argument to the callback will be either
'notSupported' or 'fileToLarge'
- completed: This callback will be called once the XHR readyState indicates the request is
complete.  The status code and responseText are passed in as parameters


*Note on Safari:*

Unfortunately, I was unable to find a way with Safari's implementation of XHR and the File API to
pass additional data parameters as part of the POST message.  So, as a fallback, any additional
data supplied to the 'data' attribute of the options hash will be sent as individual headers
with the prefix: 'UP-DATA-ITEM-'.  So if you had a data attribute called 'age', the header
key would be 'UP-DATA-ITEM-age'.  This is by no means ideal, so if anyone has an alternative
approach, I would welcome the suggestion.