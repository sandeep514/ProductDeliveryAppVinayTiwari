import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {Card, ListItem, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import {Colors} from '../components/Colors';
import {widthToDp, heightToDp} from '../utils/Responsive';
import MainScreen from '../layout/MainScreen';
import DashboardCard from '../components/DashboardCard';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandString, getPriorityDrivers, getPrioritySortedDrivers, getTodaySale, getVehicleLoadCount } from '../api/apiService';
import { ActivityIndicator } from 'react-native';
// import GetLocation from 'react-native-get-location'

export default function Dashboard({navigation , route}) {
	const [ userName ,setuserName ] = useState();
	const [ selectedVehicle ,setselectedVehicle ] = useState();
	const [ selectedVehicleCount ,setSelectedLoadCount ] = useState();
	const [ SalesOfDay ,setSalesOfDay ] = useState();
	const [ TotalAmount ,setTotalAmount ] = useState();
	const [ listRoute ,setListRoute ] = useState();

	function getLocation() {
		// GetLocation.getCurrentPosition({enableHighAccuracy: true,timeout: 10000,
		// }).then(location => {
		// 	AsyncStorage.setItem( 'location' , JSON.stringify(location));
		// }).catch(error => {
		// 	const { code, message } = error;
		// })
	}
	function getRoutes(){
		AsyncStorage.getItem('selectedRoute').then((routeId) => {
			AsyncStorage.getItem('user_id').then((driverid) => {
				getPriorityDrivers(driverid , routeId).then((res) => {
					setListRoute(res.data.data);
				} , (err) =>{

				})
			}) 
		})	
	}

	useEffect(() => {
		// AsyncStorage.getAllKeys()
    	// .then((keys)=> AsyncStorage.multiGet(keys)
        //             .then((data) => console.log(data)));

		AsyncStorage.getItem('selectedVehicleNo').then((value) => {
			let vehicheId = value;
			AsyncStorage.getItem('selectedLoadsNumbers').then((value) => {
				let load_numbers = value;
				if( selectedVehicleCount == undefined ){
					getVehicleLoadCount(vehicheId , load_numbers).then((data) => {
						setSelectedLoadCount(data.data.data)
					});
				}
			});
		});

		AsyncStorage.getItem('user_name').then((value) => {
			setuserName(value);
		})
		AsyncStorage.getItem('vehicle_no').then((value) => {
			setselectedVehicle(value);
		})

		getSalesOfDay();
		getRoutes();
		getLocation();
	} , [])

	function getSalesOfDay(){
		AsyncStorage.getItem('selectedVehicleNo').then( (value) => {
			let selectedVehNo  = value;
			AsyncStorage.getItem('user_id').then((value) => {
				let driverId =  value;

				getTodaySale(driverId,selectedVehNo).then((res) => {
					setSalesOfDay(res.data.data);
					setTotalAmount(res.data.amount);
				});
			})
		})
	}

	return (
		<MainScreen>
			<View style={styles.cardSection}>
				<DashboardCard
					backgroundColor={Colors.primary}
					cardName={userName}
					icon="user"
					onPress={() => {
						navigation.push('Profile');
					}}
				/>
				<DashboardCard
					backgroundColor={Colors.skyBlue}
					cardName={selectedVehicle}
					icon="truck"
					onPress={() => {
						navigation.push('VehicleScreen');
					}}
				/>
				<DashboardCard
					backgroundColor={Colors.parrotGreen}
					cardName="ITEMS"
					icon="shopping-cart"
					displayBadge={true}
					badgeValue={(selectedVehicleCount) ? selectedVehicleCount: <ActivityIndicator size="small" color="white"></ActivityIndicator> }
					onPress={() => {
						navigation.push('Items');
					}}
				/>
				<DashboardCard
					backgroundColor={Colors.primary}
					cardName="Loads"
					icon="plus"
					onPress={() => {
						navigation.push('Demandstock' );
					}}
				/>

				<DashboardCard
					backgroundColor={Colors.skyBlue}
					cardName="Un-Delivered"
					icon="list"
					onPress={() => {
						navigation.push('undeliveredItems' );
					}}
				/>
				<DashboardCard
					backgroundColor={Colors.yellow}
					cardName="ROUTES"
					icon="map"
					onPress={() => {
						navigation.push('DashboardRoutes' , {'myRoutes' : listRoute});
					}}
				/>
				
				
			</View>
			
			{/* <Pressable style={{padding: 10,backgroundColor: 'green'}} onPress={() => { navigation.push('Demandstock') }}>
				<Text style={{textAlign: 'center',color: 'white',fontSize: 20}}>Generate New Load</Text>
			</Pressable> */}

			<View style={styles.barSection}>
				<Text style={styles.detailBar} allowFontScaling={false}>
					Sales for Today
				</Text>
				<Text style={styles.detailBar} allowFontScaling={false}>
					<TouchableOpacity onPress={() => { getSalesOfDay() }}><Text style={styles.detailBar} allowFontScaling={false}>Refresh</Text></TouchableOpacity>
				</Text>

				<Text style={styles.barText} allowFontScaling={false}>
					{(TotalAmount != undefined) ? 'Total: £'+TotalAmount : <Text></Text> }
				</Text>
			</View>

			<View style={styles.itemListSection}>
				<ScrollView vertical='true'>
					{(SalesOfDay != undefined) ?
						Object.values(SalesOfDay).map((l, i) => (
							<TouchableHighlight key={generateRandString()}>
								<ListItem bottomDivider key={generateRandString()}>
									<ListItem.Content key={generateRandString()}>
										<ListItem.Title key={generateRandString()} style={{fontSize: 14}} allowFontScaling={false}>
											{l[0].buyer_rel.name}
										</ListItem.Title>
										<ListItem.Subtitle allowFontScaling={false} >
											<Text style={{fontSize: 10}}>Invoice Number: {l[0].invoice}</Text>
										</ListItem.Subtitle>
										<ListItem.Subtitle allowFontScaling={false} >
											<Text style={{fontSize: 11}}>{l[0].sale_price} x {l[0].qty}</Text>	
										</ListItem.Subtitle>
									</ListItem.Content>
									<View key={generateRandString()}>
										<Text key={generateRandString()}>£ {(l.invoiceTotal).toFixed(2)}</Text>
									</View>
								</ListItem>
							</TouchableHighlight>
						))
					: 
						<View>
							<ActivityIndicator size="large" color={Colors.primary} />
						</View>
					}
				</ScrollView>
			</View>
		</MainScreen>
  	);
}

const styles = StyleSheet.create({
  cardSection: {
    height: heightToDp('20%'),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5%',
  },
  barSection: {
    height: heightToDp('4%'),
    backgroundColor: Colors.darkPurple,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  itemListSection: {
    flex: 1,
    // borderColor: Colors.redMaroon,
    // borderWidth: 4,
  },
  detailBar: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: heightToDp(2),
  },
  barText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: heightToDp(2),
  },
});
