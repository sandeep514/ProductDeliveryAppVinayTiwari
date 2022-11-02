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
Pressable,
FlatList
} from 'react-native';
import {Colors} from '../../components/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ListItem, Avatar, Header, Button, Input} from 'react-native-elements';
import {useState, useEffect} from 'react';
import {generateRandString, getCartItemDetails, getDiverId, getListInvoices, getVehicle, imagePrefix} from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {searchBuyerByInvoiceNumber, getSaleItemByInvoice} from '../api/apiService';
import { ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import { BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';
import { StarPRNT } from 'react-native-star-prnt';

const win = Dimensions.get('window');
export default function ListComponent({item , ViewRecieptState , PrintReceiptState}) {
    const [printingIndicator , setPrintingIndicator] = useState(false);

    useEffect(() => {
        // console.log(item[0].id)
    } , []);

    const ViewReciept = (item) => {
        ViewRecieptState(item)
    }
    const printRecpt = (item) => {
        PrintReceiptState(item)
    }

    return (
        <TouchableHighlight key={item[0].id} >
            <ListItem bottomDivider key={item[0].id}>
                <ListItem.Content key={item[0].id}>
                    <ListItem.Title  style={{fontSize: 14}} allowFontScaling={false}>
                        {item[0]["buyer_rel"].name}
                    </ListItem.Title>
                    <ListItem.Subtitle allowFontScaling={false} >
                        <Text style={{fontSize: 10}}>{item[0].invoice_no} ( {item[0].idate} )</Text>
                    </ListItem.Subtitle>
                </ListItem.Content>
                <View>
                    <Pressable style={{backgroundColor: 'lightgreen',paddingHorizontal: 20,paddingVertical: 10}} 
                        onPress={() => { ViewReciept(item) }} 
                    >
                        <Text style={{color: 'white'}}>View</Text>
                    </Pressable>
                </View>
                <View>
                    <Pressable style={{backgroundColor: Colors.primary,paddingHorizontal: 20,paddingVertical: 10}} 
                        onPress={() => { setPrintingIndicator(true); printRecpt(item) }} 
                    >
                        <Text style={{color: 'white'}}>Print</Text>
                    </Pressable>
                </View>
            </ListItem>
        </TouchableHighlight>
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
mainBox: {
flex: 1,
flexDirection: 'row',
justifyContent: 'center',
borderColor: 'red',
height: 90,
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
height: 90,
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
textInput:{
    borderColor: 'lightgrey',
    borderWidth: 1,
    marginHorizontal: 17,
    paddingHorizontal: 17,
    borderRadius: 100,
    color: '#000'
}
});