// @ts-nocheck

/**
 * doc gen
 * this is currently put together roughly for svelte hack
 * i will refine it much better later
 */

import { sample } from 'openapi-sampler';
import yaml from 'js-yaml';

export const generateDocs = (specSource) => {
	let spec = {};

	// smh convert this yaml file to docs
	console.log('generating docs');
	let data = yaml.load(specSource);
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

	let tags = data.tags.map((v) => {
		v.endpoints = [];
		return v;
	});

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

				requestBody = {
					samples: generateExample(requestBody.content, data)
				};
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

	let rsps = ref.split('/').slice(1);
	const rf = rsps.reduce((prev, curr) => {
		return prev[curr];
	}, data);

	return rf;
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
			example = sample(value.schema, { skipReadOnly: true }, data);
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

	if (doc.requestBody) {
		command += `\n     - H Content-Type: ${doc.requestBody.samples[0].mediaType}`;
		command += `\n     - d '${JSON.stringify(doc.requestBody.samples[0].example)}'`;
	}

	return command;
};
