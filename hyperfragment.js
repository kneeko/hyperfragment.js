/*! The MIT License (MIT) Copyright (c) 2015 Nico Prins

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

;(function() {

	var query = function(node, selector) {
		return Array.prototype.slice.call(node.querySelectorAll(selector));
	};

	var add_fragment_handler = function(anchor) {
		if (anchor.hostname === window.location.hostname) {
			anchor.addEventListener("click", handler);
		}	
	}
	
	var handler = function(event) {
	
		event.preventDefault();

		var xhr = new XMLHttpRequest();
		var href = this.getAttribute("href");

		xhr.onload = function() {

			var xml = this.responseXML;
			var fragments = query(xml, "[data-fragment]");

			// if there are no fragments we should probably just follow the link
			if (fragments.length == 0)
				return window.location = href;

			// set the title and url according to the response
			if (href != location.pathname) {
				document.title = xml.title;
				history.pushState(null, null, href);
			}

			// replace elements with corresponding types
			fragments.map(function(fragment) {
				var type = fragment.getAttribute("data-type");
				query(fragment, "a").map(add_fragment_handler);
				var selector = "[data-fragment][data-type=\"" + type + "\"]";
				query(document, selector).map(function(match) {
					match.parentNode.replaceChild(fragment, match);
				});
			});

			// elements associated with a section should be updated
			var el = xml.querySelector("meta[name=\"section\"]");
			if (el) {
				var section = el.getAttribute("content");
				query(document, "[data-section]").map(function(node) {
					node.removeAttribute("data-active");
				});
				query(document, "[data-section=" + section + "]").map(function(node) {
					node.setAttribute("data-active", true);
				});
			}
		}

		xhr.open("GET", href);
		xhr.responseType = "document"; // we want to get XML back
		xhr.send();

	};

	query(document, "a").map(add_fragment_handler);

})();

