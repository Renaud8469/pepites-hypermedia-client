const all = {
	// API Url options
	api: {
		url: process.env.NODE_ENV === "production" ? "https://pepites-hypermedia.herokuapp.com/" : "http://localhost:3005/"
	}
}

module.exports = all

