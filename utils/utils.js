const createElementWithClass = (tag, className) => {
	const el = document.createElement(tag);
	el.className = className;
	return el;
};

const setAttributes = (el, attrs) => {
	for (const key in attrs) {
		if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
		if (key === 'className') {
			el.className = attrs[key];
		} else if (key.startsWith('data-')) {
			const dataKey = key
				.slice(5)
				.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
			el.dataset[dataKey] = attrs[key];
		} else if (key.startsWith('aria-')) {
			el.setAttribute(key, attrs[key]);
		} else {
			if (el[key] !== undefined) {
				el[key] = attrs[key];
			} else {
				el.setAttribute(key, attrs[key]);
			}
		}
	}
	return el;
};
const createLabel = (id, text) => {
	const labelEl = createElementWithClass('label', 'contact__form-label');
	setAttributes(labelEl, { for: id, textContent: text });
	return labelEl;
};

const createOptionElement = (options) => {
	return options.map(({ value, text }) =>
		setAttributes(document.createElement('option'), {
			value,
			textContent: text,
		}),
	);
};

const createButton = (id, text) => {
	const btn = setAttributes(document.createElement('button'), {
		type: 'button',
		textContent: text,
		id: id,
	});
	return btn;
};

export {
	createElementWithClass,
	createButton,
	createOptionElement,
	createLabel,
	setAttributes,
};
