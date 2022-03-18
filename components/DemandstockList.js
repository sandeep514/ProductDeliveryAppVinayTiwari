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
	FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Input} from 'react-native-elements';

import {Colors} from './Colors';
import {widthToDp, heightToDp} from '../utils/Responsive';
import { useState } from 'react';
import { imagePrefix } from '../api/apiService';
// import GetLocation from 'react-native-get-location'

export default function DemandstockList({navigation , route, data, savedData,savedLoadData}) {
	const [ updateSt , setupdateSt ] = useState({});
	const [products,setProducts] = useState([]);
	const [ updater , setUpdater ] = useState(false);

	useEffect(() => {
		if( savedLoadData != null && savedLoadData != undefined ){
			setupdateSt(savedLoadData)
		}
	} )

	function updaterSeter() {
		if( updater == false ){
			setUpdater(true)
		}else{
			setUpdater(false)
		}
	}

	function incrementedProduct(data){
		if( data.id in updateSt ){
			updateSt[data.id] = (updateSt[data.id]+1);  
		}else{
			updateSt[data.id] = 1;
		}
		updaterSeter();
		setupdateSt(updateSt)
		savedData(updateSt)
	}

	function decrementProduct(data) {
		if( data.id in updateSt ){
			updateSt[data.id] = (updateSt[data.id]-1);  
		}else{
			updateSt[data.id] = 0;
		}
		// updateSt[data.id] = (updateSt[data.id]-1);  
		
		updaterSeter();
		setupdateSt(updateSt)
		savedData(updateSt)
	}

	return (
		<View  style={{ flexDirection: 'row', justifyContent: 'space-around'}}>
			<View style={{width: '20%',alignItems: 'center'}}>
				<Image source={{uri: imagePrefix+'/'+data.img}} style={styles.productImage} />
			</View>
			<View style={{width: '20%',alignItems: 'center',marginTop: 10}}  >
				<Text >
					{ data.name }
				</Text>
			</View>
			<View style={{width: '20%',alignItems: 'center',marginTop: 10}}  >
				<Text >
					{(data.available != undefined) ? data.available  : 0}
				</Text>
			</View>
			<View style={{width: '20%',alignItems: 'center',flexDirection: 'row'}}  >
				<View style={{borderWidth: 1 , borderColor: 'yellow'}}>
					<Pressable style={{backgroundColor: 'red',padding:8, height: 30}} onPress={() => { decrementProduct( data ) }}>
						<Icon name='minus' type='font-awesome' style={{fontSize: 12,color: 'white', textAlign: 'center'}} />
					</Pressable>
				</View>
				<View style={{width: 100 ,}}>
					<Input
						placeholder="QTY"
						allowFontScaling={false}
						onChangeText={() => {}}
						style={{width: 100 ,textAlign: 'center',padding: 0 , margin: 0}}
						defaultValue={(data.id in updateSt)? updateSt[data.id].toString() : '0' }
						disabled
					/>
				</View>
				<View>
					<Pressable style={{backgroundColor: Colors.primary,padding:8, height: 30}} onPress={() => { incrementedProduct(data)}}>
						<Icon name='plus' type='font-awesome' style={{fontSize: 12,color: 'white', textAlign: 'center'}} />
					</Pressable>
				</View>
			</View>
			<View style={{width: '20%',alignItems: 'center',marginTop: 10}} >
				<Text > 
					{(data.id in updateSt)?
						((data.available != undefined) ?
							 (data.available )  +  updateSt[data.id]
						: 
							updateSt[data.id]
						)
					: 
						0 + (data.available != undefined) 
					? 
						(data.available )  
					: 
						0 
					}
				</Text>
			</View>
		</View>
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
