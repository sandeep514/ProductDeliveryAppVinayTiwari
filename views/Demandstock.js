import React, {useEffect} from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	SectionList,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native';
 
import {Colors} from '../components/Colors';
import {widthToDp, heightToDp} from '../utils/Responsive';
import MainScreen from '../layout/MainScreen';
import { useState } from 'react';
import { getSalesItemsForLoad, saveNewLoad } from '../api/apiService';
import DemandstockList from '../components/DemandstockList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Demandstock({navigation , route}) {
	const [ data , setData ] = useState({});
	const [ selectedVehicleNo , setSelectedVehicleNo ] = useState();
	const [ selectedVehicleId , setSelectedVehicleId ] = useState();
	const [ MyLoadNewNumber , setMyLoadNewNumber ] = useState();
	const [ mySavedLoadData , SetMySavedLoadData ] = useState();
	const [ loaded , SetLoaded ] = useState(true);

	const Item = ({ title }) => (
		<View style={styles.item}>
		  	<Text style={styles.title}>{title}</Text>
		</View>
	);
	  
	useEffect(() => {	

		AsyncStorage.getItem('vehicle_no').then((vehicleNo) => {
			setSelectedVehicleNo(vehicleNo)
		})
		AsyncStorage.getItem('selectedVehicleNo').then((vehicleNo) => {
			setSelectedVehicleId(vehicleNo)
		})
		getSalesItemsForLoads()

	} , []);

	const renderSectionHeader = ({ section: { title } }) => (
		<Text style={{padding: 10 , color: '#fff',fontSize: 20,backgroundColor:Colors.primary}} >{title}</Text>
	)
	function getSalesItemsForLoads(){
		SetLoaded(true)
		getSalesItemsForLoad().then((res) => {
			setMyLoadNewNumber(res.data.load_number)
			setData(res.data.items);
			SetLoaded(false)

		})
	}

	function saveLoad(loadData){
		SetLoaded(true)

		let processedData = { 'data' : loadData , 'vehicleNo' : selectedVehicleId , 'loadNumber' : MyLoadNewNumber }

		saveNewLoad(processedData).then((res) => {
			
			SetLoaded(false)
			alert("Load generated sucessfully");
			navigation.navigate('Dashboard');

		});

	}

	function renderAlerts({ item }) {
		return (
			<DemandstockList data={item} savedData={ (updatedData) => { SetMySavedLoadData(updatedData) } } savedLoadData={mySavedLoadData} />
		);
	  }
	
	return (
		<MainScreen>
			<View style={styles.itemListSection}>
				<View style={{flexDirection: 'row',justifyContent: 'space-between',paddingHorizontal: 12,paddingBottom: 5}}>
					{/* <Text style={{color: Colors.primary,fontSize: 18,fontWeight: 'bold'}}>{MyLoadNewNumber}</Text> */}
					<Text style={{color: Colors.primary,fontSize: 18}}>Load: <Text style={{color: Colors.primary,fontSize: 15,fontWeight: 'bold'}}>{MyLoadNewNumber}</Text></Text>
					<Text style={{color: Colors.primary,fontSize: 18}}>Vehicle: <Text style={{color: Colors.primary,fontSize: 15,fontWeight: 'bold'}}>{selectedVehicleNo}</Text></Text>
				</View>
				<View style={styles.myHeader}>
					<View style={{width: '20%'}}>
						<Text style={styles.headerTitle}>Image</Text>
					</View>
					<View style={{width: '20%'}}>
						<Text style={styles.headerTitle}>Name</Text>
					</View>
					<View style={{width: '20%'}}>
						<Text style={styles.headerTitle}>Available</Text>
					</View>
					<View style={{width: '20%'}}>
						<Text style={styles.headerTitle}>Qty</Text>
					</View>
					<View style={{width: '20%'}}>
						<Text style={styles.headerTitle}>Total</Text>
					</View>
				</View>
				{( loaded == true )? 
					<ActivityIndicator color={Colors.primary}></ActivityIndicator>
				:
					// <SectionList
					// 	sections={DATA}
					// 	keyExtractor={(item, index) => index}
					// 	renderItem={({ item }) => <Item title={item} />}
					// 	renderSectionHeader={({ section: { title } }) => (
					// 		<Text style={styles.header}>here</Text>
					// 	)}
					// />

					<SectionList
						sections={data}
						keyExtractor={item => `${item.id}`}
						renderItem={(renderAlerts)}
						renderSectionHeader={renderSectionHeader}
					/>
					// <View><Text>Here</Text></View>
				}
				
				
				
			</View>
			<Pressable style={{position: 'absolute',backgroundColor: Colors.primary , bottom: 0,margin: 20,paddingHorizontal: 21,right: 0,paddingVertical: 18,borderRadius: 100}} onPress={() => { saveLoad(mySavedLoadData) }}>
				<Icon name='chevron-right' type='font-awesome' style={{fontSize: 20,color: 'white', textAlign: 'center'}} />
			</Pressable>
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
  myHeader:{
	  	backgroundColor: "#ededed",
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 10  
  },
  headerTitle:{
	  color: Colors.primary,
	  fontSize: 16,
	  fontWeight: 'bold',
	  textAlign: 'center'
  },
  productImage: {
    width: 50,
    height: 50,
  },
});
