	import React, {Component} from 'react';
	
	import {
	StyleSheet,
	Image,
	View,
	Dimensions,
	ScrollView,
	TouchableHighlight,
	Text,
	TextInput,
	Pressable
	} from 'react-native';
	import {Colors} from './../components/Colors';
	import Icon from 'react-native-vector-icons/FontAwesome';
	import {ListItem, Avatar, Header, Button, Input} from 'react-native-elements';
	import MainScreen from '../layout/MainScreen';
	import {useState, useEffect} from 'react';
	import {getCartItemDetails, getVehicle, imagePrefix, showToast} from '../api/apiService';
	import AsyncStorage from '@react-native-async-storage/async-storage';
	import {SaveOrder} from '../api/apiService';
	import { ActivityIndicator ,Modal,Keyboard} from 'react-native';
	import { useRef } from 'react';
	import { CheckBox } from 'react-native-elements'
	import AddQty from '../components/AddQty';
	import { KeyboardAvoidingView } from 'react-native';

	const win = Dimensions.get('window');

	let setTotalAmount = 0;
	let totalAmountVatWithout = 0;
	let totalAmountVat = 0;
	let setUpdatedDataArray = [];
	let currentSelectedId = '';
	let VATUpdatedStatus = [];
	let currentSelectedLoadName = '';
	let Vsta = '';
	let selectedVehicle = '';
	let selectedRoute = '';
	let selectedDriver = '';
	let selectedBuyerId = '';
	let valuetem = '';

	let updatedValue= '';
	let initalPaymentStatus = 'cash';
	export default function AddQuantity({navigation , route}) {

		const [data, setData] = useState({});
		// const [totalAmount, setTotalAmount] = useState(0);
		const [loadedData , setLoadedData] = useState();
		const [updatedData , setUpdatedData] = useState();
		const [creaditStatus , setCreditStatus] = useState(initalPaymentStatus);
		const [loadedActivityIndicator , setLoadedActivityIndicator] = useState(false);
		const [ActInd , setActInd] = useState(false);
		const [saveOrderActivIndictor , setSaveOrderActivIndictor] = useState(false);
		const [vatStatu , setVATstatus] = useState(false);
		const [ hasNonVatProducts ,setHasNonVatProducts ] = useState(false);
		const [ hasVatProducts ,setHasVatProducts ] = useState(false);
	  	const [toggleCheckBox, setToggleCheckBox] = useState(false)
	  	const [vatStatusForProducts, setVATstatusForProducts] = useState()
	  	const [IsKeyboardOpen, setIsKeyboardOpen] = useState(false)
	  	const [modalVisible, setModalVisible] = useState(false);
	  	const [MyTotalPrice, setMyTotalPrice] = useState(0);
		const [hasUndeliveredItems , setHasUndeliveredItems] = useState(true);
		const [selectedItemFromItemsScreen , setSelectedItemFromItemsScreen] = useState();
		const [updatedFinalData , setUpdatedFinalData] = useState();
		const [customerName , setCustomerName] = useState();
		const [mytest , setMytest] = useState();
		const [changestate , setChangeState] = useState();
		const [beforeUpdPrice , setbeforeUpdatePrice] = useState({});

		let scrollRef = useRef(); 
		const ref_input2 = useRef();
		let mySelectedProducts = {}
		let finalProducts = {};
		// useEffect(() => {
		// 	finalProducts = 
		// 	if( latestPrice != null && latestPrice != undefined ){
		// 		for(let i = 0 ; i < Object.values(latestPrice).length ; i++ ){
		// 			if( Object.values(latestPrice[i])[0]['VATstatus'] == true ){
		// 				price = price + ((Object.values(latestPrice[i])[0]['sale_price'] * Object.values(latestPrice[i])[0]['order_qty'])*1.20) ;
		// 			}else{
		// 				price = price + (Object.values(latestPrice[i])[0]['sale_price'] * Object.values(latestPrice[i])[0]['order_qty'])  ;
		// 			}
		// 		}
		// 	}
		// 	setMyTotalPrice(price)
		// } , [latestPrice]);
		useEffect(() => {
			if( selectedItemFromItemsScreen != undefined ){
				// console.log("jnjknk");
				selectedLoadedItemsByQty();
			}
		} , [selectedItemFromItemsScreen])

		useEffect(() => {
			AsyncStorage.getItem('selectedInvoiceId').then((id) => {

			})

			AsyncStorage.getItem('beforeUpdatePrice').then((res) => {
				if(res != null){
					if( Object.keys(JSON.parse(res)).length > 0 ){
						setbeforeUpdatePrice(JSON.parse(res))
						// for(let i = 0 ; i < Object.keys(JSON.parse(res)).length ; i++){
						// 	if( val?.loadId in JSON.parse(res) ){
						// 		setbeforeUpdatePrice(JSON.parse(res))
						// 		return false;
						// 	}
						// }	
					}
				}
			})
			AsyncStorage.getItem('selectedBuyerRouteName').then((buyerName) => {
				setCustomerName(buyerName)
			});
			mySelectedProducts = route.params.mySelectedItems;
			setSelectedItemFromItemsScreen(route.params.mySelectedItems);

			totalAmountVatWithout = 0;
			totalAmountVat = 0;
			setUpdatedDataArray = [];
			// return () => { 
				// 	// AsyncStorage.removeItem('finalItems');
				// 	setUpdatedDataArray = [];
				// 	// AsyncStorage.setItem('finalItems' , JSON.stringify({}))
				// }
				return () => {
					totalAmountVatWithout = 0;
					totalAmountVat = 0;
					setUpdatedDataArray = [];
					VATUpdatedStatus = [];

					setSaveOrderActivIndictor(false)
			}
		} , [])
		
		function selectedLoadedItemsByQty() {
			setLoadedActivityIndicator(true)
	
			AsyncStorage.getItem('VATStatus').then((data) => {
				if( data == 'true' ){
					AsyncStorage.setItem('currentVATstatus' , '1');
				}else{
					AsyncStorage.setItem('currentVATstatus' , '0');
				}
				
				setVATstatus(data);
			});
			
			// AsyncStorage.getItem('selectedLoadedItemsByQty').then((data) => {

				setLoadedData(selectedItemFromItemsScreen);	

				
				getCartItemDetails(JSON.stringify(selectedItemFromItemsScreen)).then((res) => {

					let productData = res.data.data;
					for(let i = 0; i < productData.length ; i++){
						let myData = Object.values(productData)[i]; 
						if( Object.values(myData)[0]['itemcategory'] == 'EGGS' || Object.values(myData)[0]['itemcategory'] == 'eggs' ){
							setHasNonVatProducts(true);
						}else{
							setHasVatProducts(true);
						}
					}
					setData(productData);
					// let price = 0;
					// for(let i = 0; i < productData.length ; i++){
					// 	let myData = Object.values(productData)[i];
					// 	let myNewData = Object.values(myData)[0]
					// 	if( myNewData['VATstatus'] == true ){
					// 		price = price + ((myNewData['sale_price'] * myNewData['order_qty'])*1.20) ;
					// 	}else{
					// 		price = price + (myNewData['sale_price'] * myNewData['order_qty'])  ;
					// 	}
					// }
					// setMyTotalPrice(price);
					setLoadedActivityIndicator(false)
				});
			// });
			
			AsyncStorage.getItem('selectedVehicleNo').then((vehNo) => {
				selectedVehicle = vehNo;
				AsyncStorage.getItem('user_id').then((driverId) => {
					selectedDriver = driverId;
					AsyncStorage.getItem('selectedRoute').then((route) => {
						selectedRoute = route;
						AsyncStorage.getItem('selectedBuyerRouteId').then((buyerid) => {
							selectedBuyerId = buyerid;
						});
					});
				});
			});

			// AsyncStorage.getItem('itemsForVAT').then((res) => {
			// 	let VATDataRecieved = JSON.parse(res);
			// 	setVATstatusForProducts( VATDataRecieved);
			// })
		}

		function generateRandString(){
			return (Math.random() * (999999999 - 1) + 1).toFixed(0);
		}

		function updateRecords(data){
			return new Promise( (resolve , reject) => {
				let processedData = {};

				for(let i = 0 ; i < data.length ; i++ ){
					if( processedData[data[i].dnum+'__'+data[i].sitem] != undefined){	
						if( data[i].qty != 0 ){
							processedData[ data[i].dnum+'__'+data[i].sitem ] = data[i];
						}else{
							delete processedData[ data[i].dnum+'__'+data[i].sitem ];
						}
					}else{
						if( data[i].qty != 0 ){
							processedData[ data[i].dnum+'__'+data[i].sitem ] = data[i];
						}else{
							delete processedData[ data[i].dnum+'__'+data[i].sitem ];
						}
					}
				}
				resolve(Object.values(processedData))
			})
		}
		function updateFinal (data) {
			setUpdatedFinalData(data);
		}

		function showConfirmationModel(){
			setModalVisible(true);
		}

		function SaveOrders(){	
			// setSaveOrderActivIndictor(true)
			Keyboard.dismiss();

			// return false;
				// setSaveOrderActivIndictor(true)
				if( updatedFinalData == null ){
					AsyncStorage.setItem('finalItems' , JSON.stringify(setUpdatedDataArray));
				}else{
					
					let setUpdatedDataArrayProcess = [];

					for( let i = 0 ; i < updatedFinalData.length ; i++){						
						let processedData = Object.values(updatedFinalData[i])[0];

						setUpdatedDataArrayProcess.push({'VATStatus' : processedData?.VATstatus ,"dnum":processedData?.loadId,"route":selectedRoute,"vehicle":selectedVehicle,"driver":selectedDriver,"buyer":selectedBuyerId,"sitem":processedData?.id,"qty":processedData?.order_qty,"credit":"NO","sale_price":processedData?.sale_price})
					}
					setUpdatedDataArray = setUpdatedDataArrayProcess;
					
					AsyncStorage.setItem('finalItems' , JSON.stringify(setUpdatedDataArray));

				}

				updateRecords(setUpdatedDataArray).then((res) => {
					AsyncStorage.getItem('beforeUpdatePrice').then((salePriceRes) => {
						let data = [];
						data.push(res)
						data.push({'type' : creaditStatus});
						data.push({'extraSalePrices' : salePriceRes	});
						
						// AsyncStorage.getItem('currentVATstatus').then((VATstatus) => {
							// data.push({'has_vat' : parseInt(VATstatus)});
							AsyncStorage.setItem('readyForOrder' , JSON.stringify(data));
							navigation.push('PDFmanager');
						// })
					});
				})

		}

	


		return (
			
				<MainScreen>
					 <Modal
						animationType="slide"
						transparent={true}
						visible={modalVisible}
						onRequestClose={() => {
						setModalVisible(!modalVisible);
						}}
					>
						<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>Hello World!</Text>
							<Pressable
							style={[styles.button, styles.buttonClose]}
							onPress={() => setModalVisible(!modalVisible)}
							>
							<Text style={styles.textStyle}>Hide Modal</Text>
							</Pressable>
						</View>
						</View>
					</Modal>
					<Text style={{color: Colors.primary,textAlign:'center',fontSize: 18,marginBottom: 20}}>Customer: {customerName}</Text>
					<View style={{flex:1}}>
						{/* {( vatStatu != 'true'  && hasVatProducts) ?
							<View style={{ justifyContent: 'center' }} >
								<Modal
									animationType="slide"
									transparent={true}
									visible={true}
									onRequestClose={(  ) => {
									}} >

									<View style={styles.centeredView}>
										<View style={styles.modalView}>
											<Text style={ styles.modalText }>Some of the selected items are VAT related, would you like to show VAT in invoice?</Text>
											<View style={{ flexDirection: 'row', marginTop: 20 }}>

												<Pressable style={{ backgroundColor: 'red',color: 'white',paddingHorizontal: 30,paddingVertical: 15 }} onPress={() => {updateVATstatus("0")}} >
													<Text style={{color: 'white'}}>No</Text>
												</Pressable>

												<Pressable style={{ backgroundColor: Colors.primary,color: 'white',paddingHorizontal: 30,paddingVertical: 15,marginLeft: 40}} onPress={() => updateVATstatus("1") } >
													<Text style={{color: 'white'}}>Yes</Text>
												</Pressable>

											</View>
										</View>
									</View>

								</Modal>
							</View>
						:
							<View></View>
						} */}

						{(ActInd == true) ?
							<View style={{ flex:1,position:'absolute',justifyContent:'center',height:'100%',width: '100%',backgroundColor: '#ededed',zIndex:9999,opacity: 0.5}} >
								<ActivityIndicator size="large" color={Colors.primary} />
							</View>
						:
							<View></View>
						}

						<View style={{flex: 0.06, justifyContent: 'center',flexDirection: 'row'}}>
							<View>
								<Pressable onPress={() => { setCreditStatus('cash') }} style={ (creaditStatus == 'cash') ? styles.activeStatus : styles.deActiveStatus }>
									<Text style={ (creaditStatus == 'cash') ? styles.activeStatusText : styles.deActiveStatusText }>
										CASH
									</Text>
								</Pressable>
							</View>
							<View>
								<Pressable onPress={() => { setCreditStatus('credit') }} style={ (creaditStatus == 'credit') ? styles.activeStatus : styles.deActiveStatus }>
									<Text style={ (creaditStatus == 'credit') ? styles.activeStatusText : styles.deActiveStatusText }>
										CREDIT
									</Text>
								</Pressable>
							</View>
							<View>
								<Pressable onPress={() => { setCreditStatus('bank') }} style={ (creaditStatus == 'bank') ? styles.activeStatus : styles.deActiveStatus }>
									<Text style={ (creaditStatus == 'bank') ? styles.activeStatusText : styles.deActiveStatusText }>
										BANK TRANSFER
									</Text>
								</Pressable>
							</View>
						</View>
						<View>
							<Pressable onPress={() => {
								if( changestate == false){
									setChangeState(true)
								}else{
									setChangeState(false)
								}
							}} style={{backgrountColor: 'red',borderWidth: 1, borderColor: '#ededed' ,width: 150}}>
								<Text style={{padding: 10,justifyContent: 'center',textAlign: 'center',backgroundColor: 'grey',color: 'white',borderRadius: 10}}>Calculate</Text>
							</Pressable>
						</View>

						<View style={{flex: 1}}>
							<ScrollView >

								{( loadedActivityIndicator == true ) ? 
								<View>
									<ActivityIndicator color={Colors.primary} size="large" />
								</View>
									
								:	
									(data != undefined)?
									Object.values(data).map((value , key) => {
										{currentSelectedLoadName = Object.keys(value)[0]}
										return (
											<View key={generateRandString()}>

												{Object.values(value).map((val , k) => {
													if(typeof val == 'object' && val != undefined){
														
														{currentSelectedId = val?.id}
														{valuetem = (val?.order_qty).toString()}
														{setTotalAmount = (parseFloat(setTotalAmount) + parseFloat(valuetem * val?.sale_price) )}
														
														{(selectedBuyerId != '') ? setUpdatedDataArray.push({'VATStatus' : val?.VATstatus ,"dnum":val?.loadId,"route":selectedRoute,"vehicle":selectedVehicle,"driver":selectedDriver,"buyer":selectedBuyerId,"sitem":currentSelectedId,"qty":val?.order_qty,"credit":"NO","sale_price":val?.sale_price}) : ''}
														// if( valuetem != 0 && valuetem != '0' ){
															return(
																<AddQty 
																	savedSalePrice={beforeUpdPrice}
																	updatePriceDataTest={(value) => {setMytest(value)}}
																	valuetem={valuetem}
																	data={data}
																	selectedItemFromItemsScreen={selectedItemFromItemsScreen}
																	key={generateRandString()}
																	val={val}
																	keyboard={(value) => { setIsKeyboardOpen(value)}}
																	updatedDataRes={(myUpdatedData) => {
																		updateFinal(myUpdatedData);
																	}}
																	updatedObjectRed={(myUupdatedObjectRed) => {
																		setSelectedItemFromItemsScreen(myUpdatedData)
																	}}
																	updatedPrice={ (price) => { 
																		setMyTotalPrice(price)
																	} }
																	updateMyObjectData={ (myRecord) => { 
																		// console.log(myRecord) 
																	}}
																></AddQty>
															)
														// }
													}
												})}
											</View>
										)
									})
								:
									<View></View>
								
								}
								
								
							</ScrollView>
						</View>
					</View>
					<View style={{}}>
				
						{/* {(IsKeyboardOpen == true) ? */}
						{(saveOrderActivIndictor == true) ?
							<View style={{backgroundColor: Colors.primary,textAlign: 'center',width: '100%'}}>
								{/* <Text style={{textAlign: 'center'}}><ActivityIndicator size="large" color="white"></ActivityIndicator></Text> */}
							</View>
						:
							<Pressable style={{position: 'relative',bottom: 0,padding: 16,backgroundColor:Colors.primary,flexDirection: 'row',justifyContent: 'center'}} onPress={() => { SaveOrders() }}><Text style={{textAlign: 'center',color: 'white',fontSize: 20}} > Place order and print invoice.. </Text>

							</Pressable>
						}
						{/* {setTotalAmount} */}
					</View>

				</MainScreen>
				

		);
	}

const styles = StyleSheet.create({
	vehicleImage: {width: 50, height: 50, resizeMode: 'contain'},
	plusButton: {
		position: 'relative',
		backgroundColor: Colors.parrotGreen,
		alignSelf: 'center',
	},
	minisButton: {
		position: 'relative',
		backgroundColor: Colors.redMaroon,
		alignSelf: 'center',
	},
	mainBoxTab: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		borderColor: 'red',
		height: 90,
		paddingHorizontal: 5,
	},
	mainBox: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		borderColor: 'red',
		height: 130,
		paddingHorizontal: 5,
	},
	itemBox: {
		flex: 1.9,
		flexDirection: 'row',
		// justifyContent: 'space-evenly',
		alignItems: 'center',
		borderColor: 'blue',
		height: 90,
	},
	 checkbox: {
		alignSelf: "center",
	},
	buttonBox: {
		flex: 1,
		justifyContent: 'space-around',
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: Colors.primary,
		borderWidth: 0.8,
		paddingVertical: 10,
		borderRadius: 10,
	},
	inputBox: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: 'dodgerblue',
		height: 120,
		marginRight: 25
	},
	textInput: {
		borderColor: Colors.purple,
		borderWidth: 1,
		width: 60,
		color: '#000',
		textAlign: 'center'
	},
	textInputTab: {
		borderColor: Colors.purple,
		borderWidth: 1,
		width: 60,
		color: '#000',
		textAlign: 'center'
	},
	activeStatus: {
		backgroundColor: Colors.primary,
		paddingHorizontal: 18,
		borderRadius: 15,
		paddingVertical: 10,
		borderColor: Colors.primary ,
		borderWidth: 2
	},
	deActiveStatus: {
		paddingHorizontal: 18,
		borderRadius: 15,
		paddingVertical: 10,
		marginHorizontal: 10 ,
		borderColor: Colors.primary ,
		borderWidth: 2
	},
	activeStatusText: {
		color: 'white'
	},
	deActiveStatusText: {
		color: Colors.primary
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22
	},
	 modalView: {
			margin: 20,
			backgroundColor: "white",
			borderRadius: 20,
			height: 130,
			width: "67%",
			alignItems: "center",
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 2
			},
			shadowOpacity: 0.25,
			shadowRadius: 4,
			elevation: 5,
			justifyContent: 'center'
		},
	});