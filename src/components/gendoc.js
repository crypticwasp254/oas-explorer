// @ts-nocheck

/**
 * doc gen
 * this is currently put together roughly for svelte hack
 * i will refine it much better later
 */
import { sample } from 'openapi-sampler';
import yaml from 'js-yaml';
import JsonPointer from 'json-pointer';
import { Spectral } from '@stoplight/spectral-core';
import { truthy } from '@stoplight/spectral-functions';

/// beter gendoc
// lint first ++
// if no linter error -> gendocs
// collect tags -> walk the schema till we fail
// on fail lint the line and continue or halt | generate a suggestion [oh yeah]

export const lintDoc = (specSource) => {
	const spectral = new Spectral();
	spectral.setRuleset({
		// this will be our ruleset
		rules: {
			'no-empty-description': {
				given: '$..description',
				message: 'description must not be empty',
				then: {
					function: truthy
				}
			}
		}
	});

	return spectral.run(specSource);
};

export const generateDocs = (specSource, fileType = 'application/x-yaml') => {
	// const mydoc = new Document()
	let spec = {};

	let data = {};
	if (fileType === 'application/x-yaml') {
		data = yaml.load(specSource);
	} else {
		data = JSON.parse(specSource);
	}

	// const oas = new Oas(data);
	// console.log(oas.getTags());

	// const oas_linter = new OasLinter();
	// oas_linter.loadDefaultRules();
	// let x = oas_linter.lint('schema', data, 'parameter', { metadata: {}, verbose: 2 });
	// console.log(x);

	// smh convert this yaml file to docs
	spec.info = data.info;

	spec.paths = Object.keys(data.paths).map((k) => {
		return {
			route: k,
			methods: Object.keys(data.paths[k]).filter((ke) =>
				['post', 'get', 'put', 'delete', 'options'].includes(ke)
			)
		};
	});

	spec.servers = spec.components = Object.keys(data.components).map((k) => {
		return {
			title: k,
			values: Object.keys(data.components[k])
		};
	});

	let tags = [];
	data?.tags?.map((v) => {
		v.endpoints = [];
		return v;
	});

	// let tags = data.tags.map((v) => {
	// 	v.endpoints = [];
	// 	return v;
	// });

	Object.values(data.paths).forEach((val, index) => {
		let path_global_params = undefined;
		let methods = Object.keys(val);
		if (val.parameters) {
			path_global_params = val.parameters;
		}

		// methods
		Object.values(val).forEach((v, vindex) => {
			// only supports one tag per operation
			let tag = v.tags?.[0];
			let target_tag = tags.filter((tg) => tg.name === tag)[0];

			let method = methods?.[vindex];

			/// parameter parsing
			let parameters = null;
			if (path_global_params) parameters = path_global_params;
			if (v.parameters) {
				if (parameters) {
					parameters = [...parameters, ...v.parameters];
				} else {
					parameters = v.parameters;
				}
			}

			// follow refs
			if (parameters) {
				parameters = parameters.map((parameter) => {
					let param = parameter;
					if (parameter.$ref) {
						param = followRef(data, parameter.$ref);
					}

					if (param.schema) {
						if (param.schema.$ref) {
							param.schema = followRef(data, param.schema.$ref);
						}

						param.type = param.schema.type;
						delete param.schema;
					}

					return param;
				});
			}

			// request bodies
			let requestBody = null;
			if (v.requestBody) {
				requestBody = v.requestBody;
				if (requestBody.$ref) {
					requestBody = followRef(data, requestBody.$ref);
				}

				if (requestBody?.content) {
					requestBody = {
						samples: generateExample(requestBody.content, data)
					};
				}
			}

			/// response parsing
			let responses = null;
			if (v.responses) {
				let res = Object.entries(v.responses).reduce((acc, keyval) => {
					let [key, value] = keyval;
					if (value.$ref) {
						value = followRef(data, value.$ref);
					}

					value = {
						samples: generateExample(value.content, data)
					};

					acc[key] = value;
					return acc;
				}, {});

				responses = res;
			}

			/// curl example

			let docssrc = {
				summary: v?.summary,
				description: v?.description,
				method,
				path: Object.keys(data.paths)?.[index],
				parameters,
				requestBody,
				responses
			};

			docssrc.curlExample = genCurl(docssrc);

			target_tag?.endpoints.push(docssrc);
		});
	});

	spec.tags = tags;

	return spec;
};

const followRef = (data, ref) => {
	if (!ref.startsWith('#')) {
		return ref;
	}

	try {
		return JsonPointer.get(data, ref.substring(1));
	} catch (err) {
		console.log('an error getting ref', err);
		return ref;
	}
};

const generateExample = (content, data) => {
	let examples = [];
	if (!content) return [];
	for (const [key, value] of Object.entries(content)) {
		let example = undefined;

		if (value.examples) {
			example = Object.values(value.examples)?.[0]?.value;
		}

		if (!example) {
			try {
				example = sample(value.schema, { skipReadOnly: true }, data);
			} catch (e) {
				console.log('error sampling', e);
				example = '? invalid';
			}
		}

		if (example) examples.push({ mediaType: key, example });
	}

	return examples;
};

const genCurl = (doc) => {
	let command = `curl - X ${doc.method.toUpperCase()} ${doc.path}`;

	if (doc.parameters) {
		let qs = doc.parameters.reduce((acc, prm) => {
			if (prm['in'] === 'query') {
				if (acc.length) acc += '&';
				acc += `${prm.name}={${prm.name}}`;
			}
			return acc;
		}, '');
		command += `?${qs}`;
	}

	if (doc.responses) {
		let firstres = Object.values(doc.responses)[0];
		let accept = firstres?.samples?.[0];

		if (accept?.mediaType) {
			command += `\n     - H Accept: ${accept.mediaType}`;
		}
	}

	if (doc?.requestBody?.samples) {
		command += `\n     - H Content-Type: ${doc.requestBody.samples[0].mediaType}`;
		command += `\n     - d '${JSON.stringify(doc.requestBody.samples[0].example)}'`;
	}

	return command;
};
