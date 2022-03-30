import React, {useState,useEffect} from 'react';
import {ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';
import {Icon, Input, ListItem} from 'react-native-elements';
import {Colors} from '../components/Colors';
import MainScreen from '../layout/MainScreen';
import {heightToDp} from '../utils/Responsive';
// import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPriorityDrivers, getSaleItemByInvoice, saveSortedPriority  } from '../api/apiService';
import { Text } from 'react-native';
import ItemComponent from './component/inputcomponent';

// import { BoardRepository , Board } from 'react-native-draganddrop-board'

	const data = [
		{
			id: 1,
			name: "Today's routes",
			rows: [
				{
					id: '1',
					name: 'Analyze your audience',
					// description: 'Learn more about the audience to whom you will be speaking'
				},
	
			]
		}
	]
    export default function DashboardRoutes({navigation , route}) {
		const [coord , setCoord] = useState({
            latitude: 31.6206,
            longitude: 74.8801,
            latitudeDelta: 1,
            longitudeDelta: 1,
        })

        const [listRoutes , setListRoutes] = useState();
        const [listRoute , setListRoute] = useState();
        const [boardRepo , setBoardRepo] = useState();
        const [hasRoutes , setHasRoutes] = useState(false);
        const [SaveLoader , setSaveLoader] = useState(false);
        const [reloader , setReloader] = useState(false);
        const [sortedLists , setSortedLists] = useState({});
        const [newUpdatedList , setNewUpdatedList] = useState([]);
        const [ActInd , setActInd] = useState(false);

	    // let boardRepository = new BoardRepository(route.params.myRoutes);
        // useEffect(() => {
        //  	getRoutes();
        // } , [reloader])

        useEffect(() => {

            AsyncStorage.removeItem('selectedLoadedItemsByQty');
            AsyncStorage.removeItem('cartItems')
            AsyncStorage.removeItem('itemsAddedInCart')
            AsyncStorage.setItem('selectedLoadedItemsByQty',JSON.stringify({}));
            AsyncStorage.setItem('beforeUpdatePrice' , JSON.stringify({}));
            AsyncStorage.removeItem('beforeUpdatePrice');

            getRoutes()
            // AsyncStorage.getItem('location').then( (data) => {
            //     let currentLoc = JSON.parse(data)
            //     setCoord({  latitude: currentLoc.latitude,
            //                 longitude: currentLoc.longitude,
            //                 latitudeDelta: 1,
            //                 longitudeDelta: 1
            //             })
            // })
            
          return function cleanup() {
			  console.log("knk");
            AsyncStorage.removeItem('selectedInvoiceId') , AsyncStorage.removeItem('newSortedArray');
          };
								
            // return () => { AsyncStorage.removeItem('selectedInvoiceId') , AsyncStorage.removeItem('newSortedArray') }
            return () => { AsyncStorage.removeItem('newSortedArray') }
        } , [])

		function gotoCart(invoiceNo, selectedBuyer) {
			setActInd(true)
			getSaleItemByInvoice(invoiceNo).then((data) => {

        	setActInd(false)
				AsyncStorage.setItem('cartItems' , JSON.stringify(data.data.data));
	
				AsyncStorage.setItem('selectedInvoiceId' , invoiceNo);
				AsyncStorage.setItem('selectedBuyer' , (selectedBuyer).toString());
				let myRecords = {};
				let myRecordsFinal = {};
				let relData = data.data.data;


				if( data != undefined ){

					for(let i = 0 ; i < relData.length; i++){
						let dnum = relData[i].dnum;
						let sitem = relData[i].sitem;
						let qty = relData[i].qty;
	
						myRecords[relData[i].dnum+'_'+relData[i].sitem] = qty;
						myRecordsFinal[relData[i].dnum+'__'+relData[i].sitem] = {'buyerId' : selectedBuyer, 'value' : JSON.parse(qty) , 'cardId' :relData[i].sitem,'VATstatus': false };

						AsyncStorage.setItem('undeliveredItems' , JSON.stringify(myRecordsFinal))
						AsyncStorage.setItem('selectedLoadedItemsByQty' , JSON.stringify(myRecordsFinal))
						AsyncStorage.setItem('itemsAddedInCart' , JSON.stringify(myRecords))
					}
				}
				navigation.push('ItemsScreenWithQty' , { mySelectedItems: myRecordsFinal});
				// navigation.push('AddQuantity' , { mySelectedItems: myRecordsFinal});
			})
		}

		const getBuyerIds = (data) => {
			let sortedList = [];
			return new Promise((resolve , reject) => {
				if( data != undefined ){
					for( let i = 0 ; i < data.length ; i++ ){
						sortedList.push(data[i].id);
					}	
					resolve(sortedList);
				}else{
					reject("some error")
				}
			})
		}
		
        const getRoutes = () => {
            AsyncStorage.getItem('selectedRoute').then((routeId) => {
                AsyncStorage.getItem('user_id').then((driverid) => {
                    getPriorityDrivers(driverid , routeId).then((res) => {
						// console.log(res.data.data)
                        setHasRoutes(true)
                        setListRoute(res.data.data);
                        getBuyerIds(res.data.data).then((res) => {
                          setSortedLists(res);
                        }).catch((err) => {
							return err;
                        })
                    } , (err) =>{
						return err;
                    })
                }) 
            })	
        }

        const [coordinates ,setcoordinates] = useState([
            {
                
            },
            {
                latitude: 31.6206,
                longitude: 74.8801,
                latitudeDelta: 1,
                longitudeDelta: 1,
            }
        ]);

        const [active, setActive] = new useState();

        const listClicked = (listData) => {
			if(  'latest_invoice' in listData ){
				setActive(listData.id);
				AsyncStorage.setItem( 'selectedBuyerRouteName', listData.name);	
				AsyncStorage.setItem( 'selectedBuyerRouteId', (listData.id).toString());
				gotoCart(listData.latest_invoice , listData.id)
			}else{				
				setActive(listData.id);
				AsyncStorage.setItem( 'selectedBuyerRouteId', (listData.id).toString());
				AsyncStorage.setItem( 'selectedBuyerRouteName', listData.name);	
				
			}
            // setcoordinates([{} ,{    latitude: parseFloat(listData.latitude),
            //                         longitude: parseFloat(listData.longitude),
            //                         latitudeDelta: 1,
            //                         longitudeDelta: 1
            //                     }])


        };

		const saveSort = () => {
			setSaveLoader(true)
			AsyncStorage.getItem('selectedRoute').then((routeId) => {
                AsyncStorage.getItem('user_id').then((driverid) => {
					saveSortedPriority( sortedLists , driverid , routeId).then((res) => {
						setSaveLoader(false);
						if(reloader) {
							setReloader(false)
						}else{
							setReloader(true)
						}
						
					}).catch((err) => {
					});
				})
			});
		}


        return (
          <MainScreen>
			  {/* <View style={{ 
							alignItems: 'center',
							justifyContent:'center',
							// position: 'absolute',
							width: '96%',
							height: 45,
							zIndex: 9999,
							top: 0,
							// right: '33%',
							// padding: 18,
							backgroundColor: Colors.primary,
							borderRadius: 100,
							margin: 10
					}}>
					{(!SaveLoader) ?
						<Pressable
							onPress={() => {
								saveSort();
							}}
						>
							<Text style={{color: '#fff' , fontSize: 20}}>Save Sort</Text>
						</Pressable>
						:
						<ActivityIndicator color='#fff' size={20} />
					}
				</View> */}
            <View style={styles.container}>
              {/* <Board
                            boardRepository={boardRepository}
                            open={() => {}}	
                            onDragEnd={() => {}}
        					isWithCountBadge={ true }
                            boardBackground="no"
                        /> */}
					

              <View style={styles.nextButton}>


                <Pressable
                  onPress={() => {
                    if (active != undefined) {
                      AsyncStorage.setItem(
                        'selectedLoadedItemsByQty',
                        JSON.stringify({}),
                      );
                      navigation.push('ItemsScreenWithQty');
                    } else {
                      alert('Please select any buyer');
                    }
                  }}>
                  <Icon
                    name="chevron-right"
                    type="font-awesome"
                    color="white"
                    style={{padding: 10}}
                  />
                </Pressable>
              </View>
			  	{(ActInd == true) ?
					<View style={{ flex:1,position:'absolute',justifyContent:'center',height:'100%',width: '100%',backgroundColor: '#ededed',zIndex:9999,opacity: 0.5}} >
						<ActivityIndicator size="large" color={Colors.primary} />
					</View>
				:
					null
				}
              <View style={{padding: 0, margin: 0}}>
                <ScrollView>
                  {hasRoutes != false && listRoute != undefined ? (
                    listRoute.map((l, i) => (
                      <TouchableHighlight
						style={{padding:0 ,margin: 0}}
                        key={i}
                        onPress={event => listClicked(l)}>
                        <ListItem
                          	containerStyle={
                            active == l.id
                              ? styles.active
                              : l.delivery_status == 0
                              ? {backgroundColor: '#ff6363'}
                              : l.delivery_status == 1
                              ? {backgroundColor: 'white'}
                              : {backgroundColor: 'blue'}
                          }
							key={i}
							bottomDivider>
								{/* <View style={{padding: 0 , margin: 0,width: 60,marginTop: 15,height: 60}}>
									<ItemComponent defaultImage={((l.priority)).toString()} listItems={sortedLists} sortedItm={(sortItems) => { setSortedLists(sortItems) }} buyerId={l.id} />
								</View> */}
							<Image
								source={require('../assets/images/map.png')}
								style={styles.Avatar}
							/>
							<ListItem.Content>
								<ListItem.Title
									style={
										l.delivery_status == 0
										? {color: 'white'}
										: l.delivery_status == 1
										? null
										: {color: 'white'}
									}>
									{l.name}
								</ListItem.Title>
								<ListItem.Title
									style={
										l.delivery_status == 0
										? {color: 'white', fontSize: 12}
										: l.delivery_status == 1
										? null
										: {color: 'white', fontSize: 12}
									}>
									{l.address}
								</ListItem.Title>
							</ListItem.Content>
							<Pressable onPress={() => { 
								
								navigation.push('listInvoices' , {buyerId : l.id}) }

							}>
								<Icon
									name="cog"
									type="font-awesome"
									color={Colors.primary}
									style={{padding: 10}}
								/>
							</Pressable>
                        </ListItem>
                      </TouchableHighlight>
                    ))
                  ) : (
                    <View>
						<ActivityIndicator
							color={Colors.primary}
							size="large"></ActivityIndicator>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </MainScreen>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'space-between',
            // paddingBottom: '20%',
        },
        nextButton: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent:'center',
            position: 'absolute',
            width: 70,
            height: 70,
            zIndex: 9999,
            bottom: 0,
            right: 3,
            // padding: 18,
            backgroundColor: Colors.primary,
            borderRadius: 100,
            margin: 10,
        },
        refreshBottom: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent:'center',
            position: 'absolute',
            width: 70,
            height: 70,
            zIndex: 9999,
            top: 1,
            padding: 18,
            backgroundColor: 'lightgrey',
            borderRadius: 100,
            margin: 10,
        },
        list: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        Avatar: {width: 50, height: 50, resizeMode: 'contain'},
    
        listValues: {
            color: Colors.dark,
            fontSize: heightToDp('2.5%'),
            fontWeight: '800',
        },
        titleKey: {
            color: Colors.primary,
            fontSize: heightToDp('2.5%'),
            fontWeight: '900',
        },
        logoutButton: {
            position: 'relative',
            backgroundColor: Colors.redMaroon,
            paddingHorizontal: '10%',
            borderRadius: 10,
            alignSelf: 'center',
        },
        active: {
            backgroundColor: 'pink',
            color: 'white',
        },
        unactive: {
            backgroundColor: 'white',
            color: 'white',
        },
        maps: {
            width: '100%',
            height: 310
        }
    });
