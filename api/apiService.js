import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	ToastAndroid
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import apiClient from './client';
import {
	StarPRNT
} from 'react-native-star-prnt';

export const imagePrefix = 'https://delivery-app.ripungupta.com/';

export const CheckConnectivity = () => {
	return new Promise((resolve, reject) => {
		NetInfo.fetch().then(state => {
			// console.log(state)
			if (state.isConnected == true || state.isConnected == 'true') {
				resolve('true');
			} else {
				alert('no internet connection');
				return false;
				reject();
			}
		});
	})
};

export const showToast = (message) => {
	ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 20);
};
export const generateRandString = () => {
	return (Math.random() * (9999 - 1) + 1).toFixed(0);
}

export const checkLogin = (postedData) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('driver-login', {
					username: postedData.username,
					password: postedData.password
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject('Wrong User Details.');
					}
				});
			}
		})
	});

	// return 'true';
};

// get list vehicle
export const getVehicle = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			apiClient.get('get-vehicles').then((response) => {
				if (response.data.status == true) {
					resolve(response.data.data);
				} else {
					reject('No vehicle available right now.');
				}
			});
		});
	})
}

export const getRoutes = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			apiClient.get('get-all-routes').then((res) => {
				if (res.data.status == true) {
					resolve(res.data.data)
				} else {
					reject('No routes available');
				}
			})
		})
	})
}

export const getDiverId = (driverId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			apiClient.get('get-printer-device/' + driverId).then((res) => {
				if (res.data.status == true) {
					resolve(res.data)
				} else {
					reject('No routes available');
				}
			})
		})
	})
}

// get list loads
export const getVehicleLoads = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			AsyncStorage.getItem('selectedVehicleNo').then((vehicleId) => {
				apiClient.get('get-demands-list-by-vehicle/' + vehicleId).then((response) => {
					if (response.status == 200) {
						if (response.data.data.length > 0) {
							resolve(response.data.data);
						} else {
							reject('No load available.');
						}
					} else {
						reject('No load available.');
					}
				});
			})
		})
	})
}

// get list loads
// export const getVehicleLoads = () => {
// 	return new Promise( (resolve , reject) => {
// 		apiClient.get('get-vehicles' ).then( (response) => {
// 			if( response.data.status == true ) {
// 				resolve(response.data.data);
// 			}else{
// 				reject('No vehicle available right now.');
// 			}
// 		} );
// 	})
// }

export const getItemsByVehicleAndLoads = (vehicheId, load_numbers) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('get-load-items-by-vehicle-load', {
					vehicle_id: vehicheId,
					load_numbers: JSON.parse(load_numbers)
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});

};


export const getVehicleLoadCount = (vehicheId, load_numbers) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('get-count-by-vehicle-load', {
					vehicle_id: vehicheId,
					load_numbers: JSON.parse(load_numbers)
				}).then((response) => {
					if (response.data.status == true) {
						// console.log("hbnj");
						resolve(response);
					} else {
						// console.log("kjnk");
						reject(response.data.error);
					}
				});
			}
		})
	});

};


export const getSavedNotes = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			let vehicheNumber = '';
			AsyncStorage.getItem('vehicle_no').then((value) => {
				vehicheNumber = value;
				apiClient.get('get-vehile-notes/' + vehicheNumber).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			});
		});
	});
};

export const SaveVehicleNotes = (newComment) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			let vehicheNumber = '';
			AsyncStorage.getItem('vehicle_no').then((value) => {
				vehicheNumber = value;
				apiClient.post('save-vehile-notes', {
					vehicle_number: vehicheNumber,
					comments: newComment
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});

			});
		});
	});
};

export const updatePaymentStatus = (invoice, status) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('update-invoice-payment-type', {
					invoice_number: invoice,
					payment_type: status
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});
};

//get Today sale
export const getTodaySale = (vehicheNumber, driverId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-today-sales/' + vehicheNumber + '/' + driverId).then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

// https://staging.tauruspress.co.uk/backend/public/api/get-buyer-priortity-by-driver/12/4
//get Today sale
export const getPriorityDrivers = (driverId, routeId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-buyer-priortity-by-driver/' + driverId + '/' + routeId).then((response) => {
				if (response.data.status == true) {
					console.log('response');
					console.log(response);
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

// get buyer invoices
export const getBuyerInvoices = (buyerId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-buyer-invoices/' + buyerId).then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

// update-sale-invoice-payment-type
export const updateTypeOfinvoice = (invoice, status) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			if (res == "true") {

				apiClient.post('update-sale-invoice-payment-type', {
					invoice: invoice,
					payment_type: status
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});

			}
		})
	});
};

export const getPrioritySortedDrivers = (driverId, routeId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-buyer-priority-by-driver-sorted/' + driverId + '/' + routeId).then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

//get Today sale
export const getListInvoices = (driverId, vehicheId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {
			apiClient.get('get-sales-details/' + driverId + '/' + vehicheId).then((response) => {
				console.log('response res');
				console.log(response);
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

// Check if buyer has VAT
export const checkIfBuyerHasVAT = (buyerId) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('check-buyer-has-vat/' + buyerId).then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

//add tp cart
export const getCartItemDetails = (postedData) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('get-cart-item-details', {
					data: postedData
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});
};

//add tp cart
export const updateDriverForsale = (postedData) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('update-driver-for-sale', postedData).then((response) => {

					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});

			}
		})
	});

};

//add tp cart
export const getPendingSales = (postedData) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('get-pending-sales', JSON.stringify(postedData)).then((response) => {
					if (response.data.status == true) {
						resolve(response.data);
					} else {
						reject(response.data.error);
					}
				});

			}
		})
	});


};

//Save Order
export const SaveOrder = (postedData) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('save-order', {
					data: postedData
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});

};

//get Before order details
export const BeforeOrderDetails = (postedData) => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.post('order-preview', {
				data: postedData
			}).then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});
	});
};

//Save Order
export const getSaleItemByInvoice = (invoiceNo) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('get-sale-item-by-invoice', {
					invoiceNumber: invoiceNo
				}).then((response) => {
					console.log('response');
					console.log(response.data.data);
					// console.log(response.data.data)
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});

			}
		})
	});

};

//Save Order
export const searchBuyerByInvoiceNumber = (invoiceNo) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('find-sale-item-like-invoice', {
					invoiceNumber: invoiceNo
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});

};

export const saveSortedPriority = (sortedArray, driverId, routeId) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('update-buyer-priority', {
					priorities: sortedArray,
					driverId: driverId,
					routeId: routeId
				}).then((response) => {
					if (response.data.status == 'success') {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});

}
//  https://delivery-app.ripungupta.com/backend/public/api/save-load
export const saveNewLoad = (data) => {
	return new Promise((resolve, reject) => {

		CheckConnectivity().then((res) => {
			if (res == "true") {
				apiClient.post('save-load', {
					data: data
				}).then((response) => {
					if (response.data.status == true) {
						resolve(response);
					} else {
						reject(response.data.error);
					}
				});
			}
		})
	});


};

export const getSalesItemsForLoad = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-sale-items-for-load').then((response) => {
				if (response.data.status == true) {
					resolve(response);
				} else {
					reject(response.data.error);
				}
			});
		});

	});
};

export const getItemRequirement = () => {
	return new Promise((resolve, reject) => {
		CheckConnectivity().then((res) => {

			apiClient.get('get-items-requirement').then((response) => {
				if (response.data.status == true) {
					resolve(response.data.data);
				} else {
					reject(response.data.error);
				}
			});
		});

	});
};

export const printing = (data, invoiceNo, buyerName, buyerAddress, buyerPhone, undeliveredItem, hasVatProduct, hasNonVatProducts) => {
	let commandsArray = [];
	let totalAmount = 0;

	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Center
	});
	commandsArray.push({
		appendBitmapText: "SUN FARMS",
		fontSize: 45
	});


	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: "Unit 12C, Bridge Industrial Estate,RH6 9HU\n"
	});
	commandsArray.push({
		append: "Phone: 07917105510\n"
	});
	commandsArray.push({
		append: "Email: Ukinch2@gmail.com\n"
	});
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: 'INVOICE: ' + invoiceNo
	});
	commandsArray.push({
		append: '\n'
	});

	//Customer Details
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Center
	});
	commandsArray.push({
		append: '--------------------------------\n'
	});


	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Right
	});
	commandsArray.push({
		append: 'Date: ' + data[0].idate
	});
	commandsArray.push({
		append: '\n'
	});

	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Center
	});
	commandsArray.push({
		append: '--------------------------------\n'
	});


	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: 'Customer \n'
	});
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: 'Name: '
	});
	commandsArray.push({
		append: buyerName
	});
	commandsArray.push({
		append: '\n'
	});

	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: 'Address: '
	});
	commandsArray.push({
		append: buyerName
	});
	commandsArray.push({
		append: '\n'
	});

	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: 'Phone: '
	});
	commandsArray.push({
		append: buyerPhone
	});
	commandsArray.push({
		append: '\n'
	});

	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Center
	});
	commandsArray.push({
		append: '--------------------------------\n'
	});
	let nonVatTotal = 0;

	if (hasVatProduct) {
		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Left
		});
		commandsArray.push({
			append: 'Qty  '
		});
		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Center
		});
		commandsArray.push({
			append: 'Price  '
		});
		commandsArray.push({
			append: 'Amount '
		});
		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.right
		});
		commandsArray.push({
			append: 'VAT  '
		});
		commandsArray.push({
			append: 'Total'
		});

		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Center
		});
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			append: '--------------------------------\n'
		});

		let beforeVatPrice = 0;
		let vatAmount = 0;

		for (let i = 0; i < data.length; i++) {
			if (data[i]['sale_item_rel'].itemcategory == 'EGGS' || data[i]['sale_item_rel'].itemcategory == 3 || data[i]['sale_item_rel'].itemcategory == '3' || data[i].has_vat == 1) {
				let sitem = data[i]['sale_item_rel']['name'];
				let salePrice = data[i]['sale_price'];
				let qty = data[i]['qty'];
				let vat = 0;
				let amount = 0;
				if (data[i]['sale_item_rel'].itemcategory != 'EGGS' && data[i]['sale_item_rel'].itemcategory != 3 && data[i]['sale_item_rel'].itemcategory != '3') {
					vat = ((((((data[i]['sale_price'] * data[i]['qty']) * 1.20) - (data[i]['sale_price'] * data[i]['qty'])))).toFixed(2)).toString();

					vatAmount = vatAmount + parseFloat(vat);
				}
				if (data[i]['sale_item_rel'].itemcategory == 'EGGS' || data[i]['sale_item_rel'].itemcategory == 3 || data[i]['sale_item_rel'].itemcategory == '3') {
					amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
				} else {
					amount = (((data[i]['sale_price'] * data[i]['qty']) * 1.20).toFixed(2)).toString();

				}
				beforeVatPrice = (beforeVatPrice + parseFloat((qty * salePrice)));

				totalAmount = (parseFloat(totalAmount) + parseFloat(amount));
				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Left
				});
				commandsArray.push({
					append: sitem + '\n'
				});

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Left
				});
				commandsArray.push({
					append: (qty * 1).toFixed(0) + '   '
				});

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Center
				});
				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: salePrice + '   '
				});

				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: (qty * salePrice).toFixed(2) + '   '
				});

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Right
				});

				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: vat + '   '
				});

				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: amount
				});

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Center
				});
				commandsArray.push({
					append: '\n'
				});
				commandsArray.push({
					append: '--------------------------------\n'
				});
			}
		}

		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Right
		});
		commandsArray.push({
			append: 'Amount Before VAT: '
		});
		commandsArray.push({
			appendCodePage: StarPRNT.CodePageType.CP858
		});
		commandsArray.push({
			appendEncoding: StarPRNT.Encoding.USASCII
		});
		commandsArray.push({
			appendInternational: StarPRNT.InternationalType.UK
		});
		commandsArray.push({
			appendBytes: [0x9c]
		});
		commandsArray.push({
			append: (beforeVatPrice).toFixed(2) + '\n'
		});

		commandsArray.push({
			append: 'VAT: '
		});
		commandsArray.push({
			appendCodePage: StarPRNT.CodePageType.CP858
		});
		commandsArray.push({
			appendEncoding: StarPRNT.Encoding.USASCII
		});
		commandsArray.push({
			appendInternational: StarPRNT.InternationalType.UK
		});
		commandsArray.push({
			appendBytes: [0x9c]
		});
		commandsArray.push({
			append: (vatAmount).toFixed(2) + '\n'
		});

		commandsArray.push({
			append: 'Total: '
		});
		commandsArray.push({
			appendCodePage: StarPRNT.CodePageType.CP858
		});
		commandsArray.push({
			appendEncoding: StarPRNT.Encoding.USASCII
		});
		commandsArray.push({
			appendInternational: StarPRNT.InternationalType.UK
		});
		commandsArray.push({
			appendBytes: [0x9c]
		});
		commandsArray.push({
			append: (beforeVatPrice + vatAmount).toFixed(2) + '\n'
		});

	}
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});


	if (hasNonVatProducts > 0) {
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Center
		});
		commandsArray.push({
			append: '*************************'
		});

		commandsArray.push({
			append: '\n'
		});

		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Left
		});
		commandsArray.push({
			append: 'Qty' + '     '
		});
		commandsArray.push({
			append: 'Price' + '       '
		});
		commandsArray.push({
			append: 'Amt'
		});
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			append: '--------------------------------\n'
		});

		for (let i = 0; i < data.length; i++) {
			if (data[i]['sale_item_rel'].itemcategory != 'EGGS' && data[i]['sale_item_rel'].itemcategory != 3 && data[i]['sale_item_rel'].itemcategory != '3' && data[i]['has_vat'] == '0') {
				let sitem = data[i]['sale_item_rel']['name'];
				let salePrice = data[i]['sale_price'];
				let qty = data[i]['qty'];
				let amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
				let vat = 0;
				nonVatTotal = (nonVatTotal + parseFloat(amount));

				totalAmount = (parseFloat(totalAmount));


				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Left
				});
				commandsArray.push({
					append: sitem
				});
				commandsArray.push({
					append: '\n'
				});

				commandsArray.push({
					append: (qty * 1).toFixed(0) + '       '
				});

				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: salePrice + '       '
				});

				commandsArray.push({
					appendCodePage: StarPRNT.CodePageType.CP858
				});
				commandsArray.push({
					appendEncoding: StarPRNT.Encoding.USASCII
				});
				commandsArray.push({
					appendInternational: StarPRNT.InternationalType.UK
				});
				commandsArray.push({
					appendBytes: [0x9c]
				});
				commandsArray.push({
					append: amount
				});
				commandsArray.push({
					append: '\n'
				});
				commandsArray.push({
					append: '--------------------------------\n'
				});
				// commandsArray.push({append: '\n'});
			}
		}
		commandsArray.push({
			appendAlignment: StarPRNT.AlignmentPosition.Right
		});
		commandsArray.push({
			append: 'Total: '
		});

		commandsArray.push({
			appendCodePage: StarPRNT.CodePageType.CP858
		});
		commandsArray.push({
			appendEncoding: StarPRNT.Encoding.USASCII
		});
		commandsArray.push({
			appendInternational: StarPRNT.InternationalType.UK
		});
		commandsArray.push({
			appendBytes: [0x9c]
		});

		commandsArray.push({
			append: (nonVatTotal).toFixed(2)
		});
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			append: '\n'
		});
		commandsArray.push({
			append: '--------------------------------\n'
		});
	}

	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Right
	});
	commandsArray.push({
		append: '  '
	});
	commandsArray.push({
		append: '  '
	});
	commandsArray.push({
		append: 'Grand Total: '
	});

	commandsArray.push({
		appendCodePage: StarPRNT.CodePageType.CP858
	});
	commandsArray.push({
		appendEncoding: StarPRNT.Encoding.USASCII
	});
	commandsArray.push({
		appendInternational: StarPRNT.InternationalType.UK
	});
	commandsArray.push({
		appendBytes: [0x9c]
	});

	commandsArray.push({
		append: (totalAmount + nonVatTotal).toFixed(2)
	});


	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '--------------------------------\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});


	if (undeliveredItem != undefined) {
		if (Object.values(undeliveredItem).length > 0) {
			commandsArray.push({
				append: '\n'
			});
			commandsArray.push({
				appendAlignment: StarPRNT.AlignmentPosition.Center
			});
			commandsArray.push({
				append: '******* Un Delivered *******'
			});

			commandsArray.push({
				append: '\n'
			});

			commandsArray.push({
				appendAlignment: StarPRNT.AlignmentPosition.Left
			});
			commandsArray.push({
				append: 'Item' + '                    '
			});
			commandsArray.push({
				append: 'Qty'
			});
			commandsArray.push({
				append: '\n'
			});

			commandsArray.push({
				append: '--------------------------------\n'
			});

			for (let i = 0; i < Object.values(undeliveredItem).length; i++) {

				let undeliveredItemPrice = Object.values(undeliveredItem)[i]['sale_item_rel'].name;
				let myQty = (Object.values(undeliveredItem)[i]['qty']);

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.Left
				});
				commandsArray.push({
					append: undeliveredItemPrice + '            '
				});

				commandsArray.push({
					appendAlignment: StarPRNT.AlignmentPosition.right
				});
				commandsArray.push({
					append: myQty
				});

				commandsArray.push({
					append: '\n'
				});
			}

			// commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
			// commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
			// commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
			// commandsArray.push({appendBytes:[0x9c]});
			// commandsArray.push({append: '\n'});
			// commandsArray.push({append: '--------------------------------\n'});
		}
	}
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Left
	});
	commandsArray.push({
		append: "Remarks:" + data[0]?.sale_signature_remarks?.remarks
	});

	commandsArray.push({ appendQrCode: 'https://delivery-app.ripungupta.com/backend/public/check/invoice/' + invoiceNo, QrCodeModel: "No2", QrCodeLevel: "L", cell: 8, alignment: "Center" });

	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});


	try {
		var printResult = StarPRNT.print('StarPRNT', commandsArray, 'BT:');

		// alert(printResult); // Success!
		// setRefreshPage("refresh");

		// navigation.navigate('Dashboard');
		// getListInvoice();

	} catch (e) {
		alert(e);
	}

}
export const printingUndeliveredItems = (data) => {

	let commandsArray = [];

	let totalAmount = 0;
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		appendAlignment: StarPRNT.AlignmentPosition.Center
	});
	commandsArray.push({
		appendBitmapText: "SUN FARMS",
		fontSize: 45
	});

	// commandsArray.push({append: '\n'});

	if (data != undefined) {
		if (Object.values(data).length > 0) {

			commandsArray.push({
				append: '\n'
			});
			commandsArray.push({
				appendAlignment: StarPRNT.AlignmentPosition.Center
			});
			commandsArray.push({
				append: '******* Un Delivered *******'
			});

			commandsArray.push({
				append: '\n'
			});

			commandsArray.push({
				appendAlignment: StarPRNT.AlignmentPosition.Left
			});
			commandsArray.push({
				append: 'Item' + '                    '
			});
			commandsArray.push({
				append: 'Qty'
			});
			commandsArray.push({
				append: '\n'
			});

			commandsArray.push({
				append: '--------------------------------\n'
			});

			for (let i = 0; i < Object.values(data).length; i++) {
				for (let i = 0; i < Object.values(Object.values(data)[i].data).length; i++) {
					let date = Object.values(Object.values(data)[i].data)[i].date;
					let item_name = Object.values(Object.values(data)[i].data)[i].item_name;
					let qty = Object.values(Object.values(data)[i].data)[i].qty;

					commandsArray.push({
						appendAlignment: StarPRNT.AlignmentPosition.Left
					});
					commandsArray.push({
						append: date + '     '
					});

					commandsArray.push({
						appendAlignment: StarPRNT.AlignmentPosition.right
					});
					commandsArray.push({
						append: item_name + '     '
					});
					commandsArray.push({
						appendAlignment: StarPRNT.AlignmentPosition.right
					});
					commandsArray.push({
						append: qty
					});

					commandsArray.push({
						append: '\n'
					});
				}
			}
			// commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
			// commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
			// commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
			// commandsArray.push({appendBytes:[0x9c]});
			// commandsArray.push({append: '\n'});
			// commandsArray.push({append: '--------------------------------\n'});
		}
	}

	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	commandsArray.push({
		append: '\n'
	});
	// commandsArray.push({
	// 	append: '\n'
	// });
	// commandsArray.push({
	// 	append: '\n'
	// });
	// commandsArray.push({
	// 	append: '\n'
	// });
	// commandsArray.push({
	// 	append: '\n'
	// });
	try {
		var printResult = StarPRNT.print('StarPRNT', commandsArray, 'BT:');
		return false;
		// alert(printResult); // Success!
		// setRefreshPage("refresh");

		// navigation.navigate('Dashboard');
		// getListInvoice();

	} catch (e) {
		alert('i am here')
		// alert(JSON.stringify(e));
	}

}