import {create} from 'apisauce';
const apiClient = create({
	baseURL: 'https://delivery-app.ripungupta.com/backend/public/api/',
	// baseURL: 'https://staging.tauruspress.co.uk/backend/public/api/',
	headers: {
		'x-api-key': 'WzXiux3SkPgm7bZe'
	},
});
export default apiClient;