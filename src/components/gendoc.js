//FIXME optimzation target
import yaml from 'js-yaml';
import JsonPointer from 'json-pointer';
import { sample } from 'openapi-sampler';
import pkg from '@stoplight/spectral-core';
import { truthy } from '@stoplight/spectral-functions';

const { Spectral } = pkg;

const httpMethods = new Set(['post', 'get', 'put', 'delete', 'options']);

// spectral linter
const spectral = new Spectral();
spectral.setRuleset({
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

export const lintDoc = (specSource) => {
	return spectral.run(specSource);
};

export const ensureJson = (specSource, fileType = 'application/x-yaml') => {
	if (fileType === 'application/x-yaml') {
		return yaml.load(specSource);
	} else {
		return JSON.parse(specSource);
	}
}

export const generateDocs = (data) => {
	data = data === null || data === undefined ? "" : data

	let spec = {
		openapi: '3.0.0',
		info: undefined,
		servers: [],
		tags: [],
		paths: [],
		components: [],
		methodBodies: []
	};

	// info
	if (data.info) {
		spec.info = data.info;
	}

	// servers
	if (data.servers) {
		spec.servers = data.servers
	}

	//FIXME placeholder tags
	let tagMap = new Map();
	if (data.tags) {
		spec.tags = data.tags
		spec.tags.forEach(tag => {
			tagMap.set(tag?.name, new Set([]))
		})
	}

	// paths
	if (data.paths && typeof (data.paths) === 'object') {
		let lpaths = Object.keys(data.paths).map((route) => {
			let operations = data.paths[route];

			if (operations && typeof (operations) === 'object') {
				let routeParameters = null;
				let routeMethods = [];

				Object.entries(operations).forEach(([method, methodbody]) => {
					if (method === 'parameters') {
						routeParameters = operations[method];
					}

					if (httpMethods.has(method)) {
						routeMethods.push(method);
						const methodBody = createMethodBody(route, method, methodbody, data, routeParameters);

						// FIXME find better ways to do this
						methodBody.tags.forEach(tag => {
							if (tagMap.has(tag)) {
								tagMap.get(tag).add(spec.methodBodies.length);
							} else {
								spec.tags.push({ name: tag })
								tagMap.set(tag, new Set([spec.methodBodies.length]))
							}
						})

						spec.methodBodies.push(methodBody);
					}
				})

				let rt = {
					route,
					methods: routeMethods,
				}

				return rt
			}

			return {
				route,
				methods: []
			}
		})

		spec.paths = lpaths
		// @ts-ignore
		spec.tags.mapper = tagMap;
	}

	if (data.components) {
		spec.components = Object.keys(data.components).map((k) => {
			return {
				title: k,
				values: Object.keys(data.components[k])
			}
		})
	}

	return spec;
};


const createMethodBody = (route, method, methodData, spec, topLevelRouteParameters = null) => {
	let methodBody = {
		route,
		method,
		operationId: methodData?.operationId || '[?error] missing operation id',
		summary: methodData?.summary || '[?error] missing method summary',
		description: methodData?.description || '[?error] missing description',
		tags: new Set([]),

		parameters: undefined,
		requestBody: undefined,
		responses: undefined,
		curl: undefined
	}

	if (!methodData) {
		return methodBody
	}

	// tags
	if (methodData?.tags && methodData.tags.length) {
		methodBody.tags = new Set(methodData.tags)
	}

	// parse method parameters
	if (methodData.parameters || topLevelRouteParameters) {
		let parameters = [];
		if (topLevelRouteParameters) parameters = topLevelRouteParameters;
		if (methodData.parameters) {
			parameters = [...parameters, ...methodData.parameters]
		}

		parameters = parameters.map(parameter => {
			if (parameter.$ref) {
				parameter = followRef(spec, parameter.$ref);
			}

			if (parameter.schema) {
				if (parameter.schema.$ref) {
					parameter.schema = followRef(spec, parameter.schema.$ref);
				}
			}

			return parameter;
		})

		methodBody.parameters = parameters;
	}

	// request body
	if (methodData.requestBody) {
		let requestBody = methodData.requestBody;
		if (requestBody.$ref) {
			requestBody = followRef(spec, requestBody.$ref);
		}

		if (requestBody?.content) {
			// TODO we only care about samples here
			requestBody = { samples: generateExample(requestBody?.content, methodData) };
		}

		methodBody.requestBody = requestBody;
	}

	// responses
	if (methodData.responses) {
		let responses = Object.entries(methodData.responses).reduce((acc, [key, value]) => {
			if (value.$ref) {
				value = followRef(spec, value.$ref);
			}

			// TODO we only care about sample here
			value = {
				samples: generateExample(value?.content, methodData)
			};

			acc[key] = value;
			return acc;
		}, {});

		methodBody.responses = responses
	}

	methodBody.curl = generateCurl(methodBody);

	return methodBody;
}

const followRef = (data, ref) => {
	if (!ref.startsWith('#')) {
		return { "refNotDefined": ref };
	}

	try {
		return JsonPointer.get(data, ref.substring(1));
	} catch (err) {
		console.log('an error getting ref', err);
		return { "refNotDefined": ref };
	}
};

const generateExample = (content, data) => {
	let examples = [];
	if (!content) return [];
	for (const [key, value] of Object.entries(content)) {
		let example = undefined;

		if (value?.examples) {
			example = Object.values(value.examples)?.[0]?.value;
		}

		if (!example) {
			try {
				example = sample(value.schema, { skipReadOnly: true }, data);
			} catch (_e) {
				console.log('error sampling');
				example = '[?error] missing example from sampler';
			}
		}

		if (example) examples.push({ mediaType: key, example });
	}

	return examples;
};

const generateCurl = (methodBody) => {
	let command = `curl - X ${methodBody.method.toUpperCase()} ${methodBody.route}`;

	if (methodBody.parameters) {
		let qs = methodBody.parameters.reduce((acc, prm) => {
			if (prm['in'] === 'query') {
				if (acc.length) acc += '&';
				acc += `${prm.name}={${prm.name}}`;
			}
			return acc;
		}, '');
		command += `?${qs}`;
	}

	if (methodBody.responses) {
		let firstres = Object.values(methodBody.responses)[0];
		let accept = firstres?.samples?.[0];

		if (accept?.mediaType) {
			command += `\n     - H Accept: ${accept.mediaType}`;
		}
	}

	if (methodBody?.requestBody?.samples) {
		command += `\n     - H Content-Type: ${methodBody.requestBody.samples[0].mediaType}`;
		command += `\n     - d '${JSON.stringify(methodBody.requestBody.samples[0].example)}'`;
	}

	return command;
};