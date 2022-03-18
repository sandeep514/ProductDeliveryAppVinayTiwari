import React , { useEffect , useState} from 'react';
import { ActivityIndicator, Dimensions, FlatList, SectionList } from 'react-native';
import {View, Text, StyleSheet ,TextInput } from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import { getItemsByVehicleAndLoads, imagePrefix, checkIfBuyerHasVAT, getItemRequirement, printingUndeliveredItems } from '../api/apiService';
import {Colors} from '../components/Colors';
import ItemCard from '../components/ItemCard';
import MainScreen from '../layout/MainScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
let itemList = [
	
];

const renderCard = ({ item }) => {
    return(
        <View style={{ paddingVertical: 20,paddingHorizontal: 20 ,borderBottomColor: 'lightgrey',borderBottomWidth: 1}}>
            <View style={{flexDirection: 'row' , justifyContent: 'space-between',flexWrap: 'wrap'}}>
                <Text style={{fontSize: 13}}>{item.date}</Text>
                <Text style={{fontSize: 18}}>{item.item_name}</Text>
                <Text style={{fontSize: 18,fontWeight: 'bold'}}>{item.qty}</Text>
            </View>
        </View>
    )
} 

const renderFirstArray = ({item}) => {
    if( item != undefined ){
        return(
            // <SectionList
            //     scrollEventThrottle={1000}
            //     sections = {[item.data]}
            //     initialNumToRender={20}
            //     stickySectionHeadersEnabled={false}
            //     showsVerticalScrollIndicator ={false}
            //     showsHorizontalScrollIndicator={false}
            //     contentContainerStyle={{}}
            //     keyExtractor = {(ite, ind) => ite + ind}
            //     renderSectionHeader = {({ section: { title } }) => (
            //         // <View style={{width: windowWidth,padding: 5,backgroundColor: 'skyblue'}}>
            //         //     <Text style={[styles.header, {backgroundColor: 'transparent' , color: 'white',marginLeft: 10}]} >{title}</Text>
    
            //         // </View>
            //             <Text>jiknk</Text>
            //     )}
            //     renderItem={renderCard}	
            // />
            <View> 
                <View>
                    <Text style={{fontSize: 20,backgroundColor: '#e8e8e8',textAlign: 'center',paddingVertical: 5}}>{item.title}</Text>
                </View>
                <View>
                    {item.data.map(( renderedItems , title ) => {
                        return(
                            <View style={{ flexDirection: 'row' , justifyContent: 'space-between',paddingHorizontal: 20 ,paddingVertical: 10}}>
                                <View>
                                    <Text style={{fontSize: 18}}>{ renderedItems.item_name}</Text>
                                </View>
                                <View>
                                    <Text style={{fontSize: 18}}>{renderedItems.qty}</Text>
                                </View>
                            </View>
                        )
                    })}
                </View>
            </View>

        )    
    }
}

export default function UndeliveredList({navigation , route}) {
	const [activeIndicatorLoader , setActiveIndicatorLoader] = useState(true);
	const [ListItems , setListItems] = useState();
	const [selectedItemsFromLoads , setSelectedItemsFromLoads] = useState();
	const [customerName , setCustomerName] = useState();
	const [undeliveredItems , setUnDeliveredItems] = useState();
	const windowWidth = Dimensions.get('window').width;

    useEffect(() => {
        ListItemRequisted()
    } , [])

    const ListItemRequisted = () => {
        getItemRequirement().then( (res) => {
            
            setUnDeliveredItems(res)
            setActiveIndicatorLoader(false)
        }).catch((err) => {
            // console.log("here is a error: ".err);
        })
    }
  
    return (
        
		<MainScreen >
				{(activeIndicatorLoader == true) ? 
					<ActivityIndicator size="large" color="#6c33a1" />
				:
					<Text></Text>
				}
				{(undeliveredItems != undefined) ?
                    <View  style={{marginBottom: 20}}>
                        {/* <Text style={{width: '100%',paddingBottom:10,flexDirection: 'row',flexWrap: 'wrap', fontSize: 20,textAlign: 'center' }}>{}</Text> */}
                            <SectionList
                                scrollEventThrottle={1000}
                                sections = {undeliveredItems}
                                initialNumToRender={20}
                                stickySectionHeadersEnabled={false}
                                showsVerticalScrollIndicator ={false}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{}}
                                keyExtractor = {(items, index) => items + index}
                                renderSectionHeader = {({ section: { title } }) => (
                                    <View style={{width: windowWidth,padding: 5,backgroundColor: 'skyblue'}}>
                                        <Text style={[styles.header, {backgroundColor: 'transparent' , color: 'white',marginLeft: 10}]} >{title}</Text>
                                    </View>
                                )}
                                renderItem={renderFirstArray}	
                            />

                    </View>
                // <ListComponent item={item} ViewRecieptState={(item) => { ViewPrintableReciept(item) }} PrintReceiptState={(item) => { console.log(item) } }/>
				:
					<Text></Text>
				}
			<Pressable 	
				onPress={() => { 
                    printingUndeliveredItems(undeliveredItems);
                }} style={{bottom : 10, position: 'absolute',justifyContent : 'center',padding:10 ,height: 70, width: 70,backgroundColor: Colors.primary,borderRadius: 100, right : 10}}
			>
				<Text>Print</Text>
			</Pressable>
		</MainScreen>
	);
}

const styles = StyleSheet.create({
	itemsContainer: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-evenly',
		backgroundColor: Colors.white,
		padding: 8,
	},
  	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		// marginTop: 22
	},
	 modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		height: 130,
		width: "90%",
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
	item: {
		backgroundColor: "#f9c2ff",
		padding: 20,
		marginVertical: 8
	},
	header: {
		fontSize: 26,
		backgroundColor: "#fff",
		fontWeight: 'bold'
	},
	title: {
		fontSize: 24
	}
});

