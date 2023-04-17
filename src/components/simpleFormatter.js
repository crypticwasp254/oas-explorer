import xml from 'xml-js';

export const formatCode = (codeSnippet, mediaType) => {
	switch (mediaType) {
		case 'application/json':
			return JSON.stringify(JSON.parse(codeSnippet), null, 2);

		case 'application/xml':
			return formatXml(codeSnippet);

		case 'application/x-www-form-urlencoded':
			// You can use the built-in querystring module to parse and format URL-encoded form data
			// Here's an example of how to use it:
			// const qs = require('querystring');
			// const parsed = qs.parse(codeSnippet);
			// return qs.stringify(parsed, null, 2);
			return codeSnippet;
		// Add support for other media types here
		default:
			return codeSnippet;
	}
};

const formatXml = (codeSnippet) => {
	const parsed = xml.xml2js(codeSnippet);
	return xml.js2xml(parsed, { spaces: 2 });
};
