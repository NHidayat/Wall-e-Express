const qs = require('querystring')
module.exports = {
    response: (response, status, msg, data, pagination) => {
        const result = {};
        result.status = status || 200;
        result.msg = msg;
        result.data = data;
        result.pagination = pagination;

        return response.status(result.status).json(result);
    },
    formatN: (x) => {
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getPrevLink: (page, currentQuery) => {
        if (page > 1) {
            const generatePage = { page: page - 1 }
            const resultNextLink = { ...currentQuery, ...generatePage }
            return qs.stringify(resultNextLink)
        } else {
            return null
        }
    },
    getNextLink: (page, totalPage, currentQuery) => {
        if (page < totalPage) {
            const generatePage = { page: page + 1 }
            const resultPrevLink = { ...currentQuery, ...generatePage }
            return qs.stringify(resultPrevLink)
        } else {
            return null
        }
    }
};