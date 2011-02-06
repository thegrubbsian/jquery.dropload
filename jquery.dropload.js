(function(jQuery) {

    var defaults = {
        url: "",
        paramName: "",
        data: null,
        error: function() {},
        completed: function() {}, // Fires when XHR is complete, passes XHR status and responseText
        maxFileSize: 1 // Mb
    };
	var options = null;
	var size_factor = 1048576;
	var multipart_boundary = "------multipartformboundary";

    jQuery.fn.dropload = function(args) {
        options = jQuery.extend(defaults, args);
        this.get(0).addEventListener("drop", dropped, true);
		preventDefaultDragBehavior();
    };

	function stop(e) { e.preventDefault(); return false; }

	function preventDefaultDragBehavior() {
		document.addEventListener("drop", stop, true);
        jQuery(document).bind("dragenter", stop).bind("dragover", stop).bind("dragleave", stop);
	}
    
    function dropped(e) {
        
        if (!e.dataTransfer) { return false; }
        file = e.dataTransfer.files[0];
        
        if (!validate(file)) { return stop(e); }
        
        if (window.FileReader) { // FireFox and Chrome
			prepareWithFileReader(file); 
		} else { // Safari
			processWithDataHeaders(file);
		}
        
        return stop(e);
    }

	function validate(file) {
		
		if (!window.FileReader) {
			if (!file) {
				options.error("notSupported");
				return false;
			}
		}
		
		var maxSize = size_factor * options.maxFileSize;
        if (file.size > maxSize) {
			options.error("fileToLarge");
			return false;
		}
		
		return true;
	}

    function prepareWithFileReader(file) {
        
        var reader = new FileReader();
        var processor = function(e) { processFromReader(e, file); };

        if (reader.addEventListener) { // FireFox
            reader.addEventListener("loadend", processor, false);
        } else { // Chrome
            reader.onloadend = processor;
        }
    
        reader.readAsBinaryString(file);
    }

    function processFromReader(e, file) {
	
		var xhr = null, stream = null;
	
        if (XMLHttpRequest.prototype.sendAsBinary) { // FireFox
			xhr = createRequest("sendAsBinary", file, true);
			stream = buildStream(file.name, e.target.result, false);
			xhr.sendAsBinary(stream);
        } else { // Chrome
			xhr = createRequest("encodedSend", file, true);
			stream = buildStream(file.name, e.target.result, true);
			xhr.send(stream);
        }
    }
    
    function processWithDataHeaders(file) {
        var xhr = createRequest("unencodedSend", file, false);
        
        // This is super ugly, but there doesn't seem to currently be a way
        // to send a file using XHR in Safari AND include extra data parameters.
        if (options.data) {
            jQuery.each(options.data, function(k,v) {
                xhr.setRequestHeader("UP-DATA-ITEM-" + k, v);
            });
        }
        
		xhr.send(file);
    }
    
    function createRequest(method, file, useMultipart) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", options.url + "?method=" + method, true);
        
        if (useMultipart) {
            xhr.setRequestHeader("content-type",
                "multipart/form-data; boundary=" + multipart_boundary);
        }
            
		xhr.setRequestHeader("UP-NAME", file.name);
        xhr.setRequestHeader("UP-SIZE", file.size);
        xhr.setRequestHeader("UP-TYPE", file.type);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (options.completed) {
                    options.completed(xhr.status, xhr.responseText);
                }
            }
        }
		return xhr;
    }

    function buildStream(filename, filedata, base64Encode) {

        var dashdash = '--',
        crlf = '\r\n',
        stream = '';

        jQuery.each(options.data, function(i, val) {
            stream += dashdash;
            stream += multipart_boundary;
            stream += crlf;
            stream += 'Content-Disposition: form-data; name="' + i + '"';
            stream += crlf;
            stream += crlf;
            stream += val;
            stream += crlf;
        });

        stream += dashdash;
        stream += multipart_boundary;
        stream += crlf;
        stream += 'Content-Disposition: form-data; name="' + options.paramName + '"';
        stream += '; filename="' + filename + '"';
        stream += crlf;

        stream += 'Content-Type: application/octet-stream';
        stream += crlf;
        stream += crlf;

        stream += base64Encode ? window.btoa(filedata) : filedata;
        stream += crlf;

        stream += dashdash;
        stream += multipart_boundary;
        stream += dashdash;
        stream += crlf;

        return stream;
    }

})(jQuery);