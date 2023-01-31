function jsonType(item) {
	if (typeof item === "object") {
		if (item === null)
			return "null";
		if (Array.isArray(item))
			return "array";
		return "object";
	}

	return typeof item;
}

function jsonCode(item) {
	return JSON.stringify(item, null, 2);
}

function skewerCase(name) {
	return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

class ProjectDetails {
	description = [];
	links = {};

	renderDescription() {
		// TODO: write code to render description to html
	}

	constructor(data) {
		if (jsonType(data) !== "object")
			throw TypeError(`DETAILS.json must be an object; got ${jsonCode(data)}`);

		const issues = [];

		if (jsonType(data.links) === "object")
			for (const name in data.links)
				if (typeof data.links[name] === "string")
					this.links[name] = data.links[name];
				else
					issues.push(`links[${
						JSON.stringify(name)
					}] should be a string; got ${
						jsonType(data.links[name])
					}`);
		else
			issues.push(`links must be an object; got ${jsonType(data.links)}`);

		if (Array.isArray(data.description))
			this.description = data.description;
		else
			issues.push(`description must be an array; got ${jsonType(data.description)}`);

		if (issues.length)
			console.warn(`issues with DETAILS.json:\n - ${
				issues.join("\n - ")
			}\n\nthe data is ${
				jsonCode(data)
			}`);
	}
};

class Project {
	cachedDetails = null;

	id = "PJ";
	path = ".";

	title = "[no title]";
	author = null;
	year = null;

	tags = [];

	constructor(data) {
		const MIN_YEAR = 2000;

		if (jsonType(data) !== "object")
			throw TypeError(`project data must be an object; got ${jsonCode(data)}`);

		const issues = [];
		
		if (typeof data.path === "string")
			this.path = data.path;
		else
			issues.push(`path must be a string; got ${jsonType(data.path)}`);

		if (typeof data.title === "string") {
			this.id += "-" + skewerCase(data.title);
			this.title = data.title;
		} else
			issues.push(`title should be a string; got ${jsonType(data.title)}`);

		if (typeof data.author === "string") {
			this.id += "-BY-" + skewerCase(data.author);
			this.author = data.author;
		} else
			if (data.author !== null)
				issues.push(`author should be a string or null; got ${jsonType(data.author)}`);

		if (typeof data.year === "number") {
			if (Number.isInteger(data.year) && data.year >= MIN_YEAR) {
				this.id += "-IN-" + skewerCase(data.year);
				this.year = data.year;
			} else
				issues.push(`year should be an integer and at least ${MIN_YEAR}; got ${data.year}`);
		} else
			if (data.year !== null)
				issues.push(`year should be a number or null; got ${jsonType(data.year)}`);

		if (Array.isArray(data.tags)) {
			for (let i = 0; i < data.tags.length; ++i)
				if (typeof data.tags[i] === "string")
					this.tags.push(data.tags[i]);
				else
					issues.push(`tags[${i}] should be a string; got ${jsonType(data.tags[i])}`);
		} else
			issues.push(`tags should be an array; got ${jsonType(data.tags)}`);

		if (issues.length)
			console.warn(`issues with project data:\n - ${
				issues.join("\n - ")
			}\n\nthe data is ${
				jsonCode(data)
			}`);
	}

	async getDetails() {
		if (this.cachedDetails === null) {
			const data = await (await fetch(this.path + "/DETAILS.json")).json();
			this.cachedDetails = new ProjectDetails(data);
		}

		return this.cachedDetails;
	}

	renderCard() {
		const card = document.createElement("A");
		card.href = "#" + this.id;

		const span = card.appendChild(document.createElement("SPAN"));
		span.id = "year-and-author";
		if (this.author !== null)
			span.innerHTML = `by <span id="author">${this.author}</span>`;
		if (this.year !== null)
			span.innerHTML += ` in <span id="year">${this.year}</span>`;
		span.innerHTML = span.innerHTML || "&#x2022;";

		const title = card.appendChild(document.createElement("H2"));
		title.id = "title";
		title.innerText = this.title;

		if (this.tags.length) {
			const tags = card.appendChild(document.createElement("P"));
			tags.id = "tags";
			tags.innerText = "#" + this.tags.join(" #");
		}

		const project = this;
		card.addEventListener("click", async function(event) {
			// TODO: write code to view project page
		});

		return card;
	}
};
