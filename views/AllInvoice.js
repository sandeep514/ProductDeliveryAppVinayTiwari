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
import {Colors} from './../components/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ListItem, Avatar, Header, Button, Input} from 'react-native-elements';
import MainScreen from '../layout/MainScreen';
import {useState, useEffect} from 'react';
import {generateRandString, getCartItemDetails, getDiverId, getListInvoices, getVehicle, imagePrefix, printing} from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {searchBuyerByInvoiceNumber, getSaleItemByInvoice} from '../api/apiService';
import { ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import { BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';
import { StarPRNT } from 'react-native-star-prnt';
import ListComponent from './component/ListComponent';

const win = Dimensions.get('window');

let setTotalAmount = 0;
let setUpdatedDataArray = [];
let currentSelectedId = '';
let currentSelectedLoadName = '';
let selectedVehicle = '';
let selectedRoute = '';
let selectedDriver = '';
let selectedBuyerId = '';
let valuetem = '';
let updatedValue= '';
let initalPaymentStatus = 'cash';
let unableToConnect = 0;
let commandsArray = [];

export default function AddQuantity({navigation}) {
const [data, setData] = useState();
// const [totalAmount, setTotalAmount] = useState();
const [loadedData , setLoadedData] = useState(false);
const [updatedData , setUpdatedData] = useState();
const [loadedActivityIndicator , setLoadedActivityIndicator] = useState(false);
const [printingIndicator , setPrintingIndicator] = useState(false);
const [ActInd , setActInd] = useState(false);
const [creaditStatus , setCreditStatus] = useState(initalPaymentStatus);
const [saveOrderActivIndictor , setSaveOrderActivIndictor] = useState(false);
const [selectedLoadCount , setSelectedLoadCount] = useState([]);
const [undeliveredItems , setUndeliveredItems] = useState();
const [ device ,setDevice ] = useState();
const [ isBluetoothEnabled ,setisBluetoothEnabled ] = useState(false);
const [ bluetoothName ,setBluetoothName ] = useState();
const [ hasVatProduct ,setHasVatProducts ] = useState(false);
const [ hasNonVatProducts ,setHasNonVatProducts ] = useState(false);
const [refreshPage, setRefreshPage] = useState("");
const [searchFrom, setSearchFrom] = useState();

const ref_input2 = useRef();
var paired = [];

useEffect(() => {
    getListInvoice();
    getPrinterNameByDriver();
    // console.log("i am here");
} , []);

function getListInvoice(){
    setLoadedData(true);
    AsyncStorage.getItem('selectedVehicleNo').then((value) => {
        let selectedVehNo = value;
        AsyncStorage.getItem('user_id').then((value) => {
            let driverId = value;
            getListInvoices( driverId, selectedVehNo ).then((data) => {
                setLoadedData(false);
                setUpdatedData(data.data.data)
                setSelectedLoadCount(data.data.data)
                setUndeliveredItems(data.data.undeliverdItems);
            });
        });
    });
}

function getSaleItemByInv (invoiceNo) {
    return new Promise( (resolve , reject) => {
        getSaleItemByInvoice(invoiceNo).then((res) => {
            resolve(res.data);
        });
    } ,(err) =>{
        reject(err)
    })
}

printReceipt = (data) => {
    setPrintingIndicator(true);
    let buyerName = data[0]['buyer_rel'].name;
    let buyerAddress = data[0]['buyer_rel'].address;
    let buyerPhone = data[0]['buyer_rel'].contact_no;
    let invoiceNo = data[0].invoice_no;

    AsyncStorage.getItem('user_id').then((res) => {
        getDiverId(res).then((printerName) => {
            setBluetoothName(printerName)

            if( printerName.printerType == 'star'){
                if(res != null && res != undefined){

                    getSaleItemByInv(invoiceNo).then((res) => {
                        for(let i = 0 ; i < res.data.length ; i++){
                            if( res.data[i]['sale_item_rel'].itemcategory == 'EGGS' || res.data[i]['sale_item_rel'].itemcategory == 3  || res.data[i]['sale_item_rel'].itemcategory == '3' || res.data[i].has_vat ){
                                setHasVatProducts(true)
                            }
                            if( res.data[i]['sale_item_rel'].itemcategory != 'EGGS' && !res.data[i].has_vat || res.data[i]['sale_item_rel'].itemcategory == 3  || res.data[i]['sale_item_rel'].itemcategory == '3' && !res.data[i].has_vat ){
                                setHasNonVatProducts(true)
                            }                                                    
                        }
                        printDesignStarPrinter( Object.values(res.data) , invoiceNo , buyerName ,buyerAddress , buyerPhone , res.undeliverdItems);
                        setPrintingIndicator(false);
                    },(error) => {
                        alert(error);
                    }).catch(function(error) {
                        // console.log('There has been a problem with your fetch operation: ' + error.message);
                         // ADD THIS THROW error
                          throw error;
                    });
                }
            }else{
                BluetoothManager.isBluetoothEnabled().then( (enabled) => {
                    BluetoothManager.enableBluetooth().then( (r) => {
                        
                        setisBluetoothEnabled(true)
                        if (r != undefined) {
                            for (let i = 0; i < r.length; i++) {

                                AsyncStorage.getItem('printerName').then((res) => {
                                    if(res != null && res != undefined){
                                        if(JSON.parse(r[i]).name == printerName){
                                            paired.push(JSON.parse(r[i]).name);
                                            setDevice(JSON.parse(r[i]).address)

                                            getSaleItemByInv(invoiceNo).then((res) => {
                                                for(let i = 0 ; i < res.length ; i++){
                                                    if( res[i]['sale_item_rel'].itemcategory == 'EGGS' || res[i]['sale_item_rel'].itemcategory == 3 || res[i]['sale_item_rel'].itemcategory == '3' || res[i].has_vat == "1" ){
                                                        setHasVatProducts(true)
                                                    }
                                                    if( res[i]['sale_item_rel'].itemcategory != 'EGGS' && !res[i].has_vat || res[i]['sale_item_rel'].itemcategory == 3 || res[i]['sale_item_rel'].itemcategory == '3' && res[i].has_vat == "0" ){
                                                        setHasNonVatProducts(true)
                                                    }                                                    
                                                }
                                                BluetoothManager.connect(JSON.parse(r[i]).address).then( (ress) => {
                                                    printDesign( Object.values(res) , invoiceNo , buyerName ,buyerAddress , buyerPhone );
                                                    setPrintingIndicator(false);
                                                },(e) => {
                                                    alert(e)
                                                    setPrintingIndicator(false);
                                                });
                                            },(error) => {
                                                alert(error);
                                            });
                                        }
                                    }else{
                                        alert('No Printer available');
                                    }
                                
                                })
                            }
                        }else{
                            alert('No Device detected');
                        }
                
                    },(err) => {
                        alert(err);
                    });
                },
                    (err) => {
                        alert(err);
                    },
                );
            }
        }).catch(function(error) {
            // console.log('There has been a problem with your fetch operation: ' + error.message);
             // ADD THIS THROW error
              throw error;
        });
    }).catch(function(error) {
        // console.log('There has been a problem with your fetch operation: ' + error.message);
         // ADD THIS THROW error
          throw error;
    });
};

getPrinterNameByDriver = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem('user_id').then((res) => {
            getDiverId(res).then((printerName) => {
                setBluetoothName(printerName)
                BluetoothManager.isBluetoothEnabled().then( (enabled) => {
                    BluetoothManager.enableBluetooth().then( (r) => {
                        setisBluetoothEnabled(true)
                        if (r != undefined) {
                            for (let i = 0; i < r.length; i++) {
                                // AsyncStorage.getItem('printerName').then((res) => {
                                    if(res != null && res != undefined){
                                        if(JSON.parse(r[i]).name == printerName){
                                            try {
                                                paired.push(JSON.parse(r[i]).name);
                                                setDevice(JSON.parse(r[i]).address)
                                                resolve(JSON.parse(r[i]).address);
                                            } catch (e) {
                                                alert(e);
                                            }
                                        }
                                    }else{
                                        alert('No Printer available');
                                    }
                                // })
                            }
                        }else{
                            alert('No Device detected');
                        }                
                    },(err) => {
                        alert(err);
                    });
                },
                    (err) => {
                        alert(err);
                    },
                );
            })
            resolve();
        })
    })
}

printDesignStarPrinter = async (data , invoiceNo , buyerName, buyerAddress , buyerPhone , undeliveredItem) => {
    printing(data , invoiceNo , buyerName, buyerAddress , buyerPhone , undeliveredItem ,hasVatProduct,hasNonVatProducts);
    return false
    let totalAmount = 0;
    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
    commandsArray.push({appendBitmapText: "SUN FARMS",fontSize:40});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: "Unit 12C, Bridge Industrial Estate,RH6 9HU\n"});
    commandsArray.push({append: "Phone: 07917105510\n"});
    commandsArray.push({append: "Email: Ukinch2@gmail.com\n"});
    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
    commandsArray.push({append: 'INVOICE: '+invoiceNo});
    commandsArray.push({append: '\n'});
    
    //Customer Details
    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
    commandsArray.push({append: '--------------------------------\n'});

    
    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Right});
    commandsArray.push({append: 'Date: '+data[0].idate });
    commandsArray.push({append: '\n'});

    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
    commandsArray.push({append: '--------------------------------\n'});


    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
    commandsArray.push({append: 'Customer \n'});
    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
    commandsArray.push({append: 'Name: '});
    commandsArray.push({append: buyerName});
    commandsArray.push({append: '\n'});

    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
    commandsArray.push({append: 'Address: '});
    commandsArray.push({append: buyerName });
    commandsArray.push({append: '\n'});

    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
    commandsArray.push({append: 'Phone: '});
    commandsArray.push({append: buyerPhone });
    commandsArray.push({append: '\n'});

    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
    commandsArray.push({append: '--------------------------------\n'});
    let nonVatTotal = 0;
    
    if( hasVatProduct ){
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
        commandsArray.push({append: 'Qty  '});
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
        commandsArray.push({append: 'Price  '});
        commandsArray.push({append: 'Amount '});
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.right});
        commandsArray.push({append: 'VAT  '});
        commandsArray.push({append: 'Total'});

        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
        commandsArray.push({append: '\n'});
        commandsArray.push({append: '--------------------------------\n'});

        let beforeVatPrice = 0;
        let vatAmount = 0;

        for(let i = 0 ; i < data.length ; i++){
            if( data[i]['sale_item_rel'].itemcategory == 'EGGS' || data[i]['sale_item_rel'].itemcategory == 3 || data[i]['sale_item_rel'].itemcategory == '3' || data[i].has_vat == 1){
                let sitem       = data[i]['sale_item_rel']['name'];
                let salePrice   = data[i]['sale_price'];
                let qty         = data[i]['qty'];
                let vat = 0;
                let amount = 0;
                if( data[i]['sale_item_rel'].itemcategory != 'EGGS' && data[i]['sale_item_rel'].itemcategory != 3 && data[i]['sale_item_rel'].itemcategory != '3' ){
                    vat = (( (( ( (data[i]['sale_price'] * data[i]['qty']) * 1.20 ) - (data[i]['sale_price'] * data[i]['qty']))) ).toFixed(2)).toString();
    
                    vatAmount = vatAmount + parseFloat(vat);
                }
                if( data[i]['sale_item_rel'].itemcategory == 'EGGS' && data[i]['sale_item_rel'].itemcategory == 3 && data[i]['sale_item_rel'].itemcategory == '3' ){
                    amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
                }else{
                    amount = (( (data[i]['sale_price'] * data[i]['qty']) * 1.20 ).toFixed(2)).toString();
                    
                }
                beforeVatPrice = (beforeVatPrice + parseFloat((qty*salePrice)));

                totalAmount = (parseFloat(totalAmount)+parseFloat(amount));
                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
                commandsArray.push({append: sitem+'\n'});

                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
                commandsArray.push({append: (qty*1).toFixed(0)+'   '});

                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({append: salePrice+'   '});

                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({append: (qty*salePrice).toFixed(2)+'   '});

                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Right});

                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({append: vat+'   '});

                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({append: amount});
                
                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
                commandsArray.push({append: '\n'});
                commandsArray.push({append: '--------------------------------\n'});
            }
        }

        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Right});
        commandsArray.push({append: 'Amount Before VAT: '});
        commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
        commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
        commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
        commandsArray.push({appendBytes:[0x9c]});
        commandsArray.push({append: (beforeVatPrice).toFixed(2)+'\n'});

        commandsArray.push({append: 'VAT: '});
        commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
        commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
        commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
        commandsArray.push({appendBytes:[0x9c]});
        commandsArray.push({append: (vatAmount).toFixed(2)+'\n'});

        commandsArray.push({append: 'Total: '});
        commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
        commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
        commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
        commandsArray.push({appendBytes:[0x9c]});
        commandsArray.push({append: (beforeVatPrice + vatAmount).toFixed(2)+'\n'});

    }
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});

    
    if(hasNonVatProducts > 0){
        commandsArray.push({append: '\n'});
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
        commandsArray.push({append: '*************************'});
        
        commandsArray.push({append: '\n'});
        
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
        commandsArray.push({append: 'Qty'+'     '});
        commandsArray.push({append: 'Price'+'       '});
        commandsArray.push({append: 'Amt'});
        commandsArray.push({append: '\n'});
        commandsArray.push({append: '--------------------------------\n'});
        
        for(let i = 0 ; i < data.length ; i++){
            if( data[i]['sale_item_rel'].itemcategory != 'EGGS' && data[i]['sale_item_rel'].itemcategory != 3  && data[i]['sale_item_rel'].itemcategory != '3'  && !data[i]['has_vat'] ){
                let sitem = data[i]['sale_item_rel']['name'];
                let salePrice = data[i]['sale_price'];
                let qty = data[i]['qty'];
                let amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
                let vat = 0;
                nonVatTotal = (nonVatTotal + parseFloat(amount));

                totalAmount = (parseFloat(totalAmount));

                
                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
                commandsArray.push({append: sitem});
                commandsArray.push({append: '\n'});
                
                commandsArray.push({ append: (qty*1).toFixed(0)+'       ' });

                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({ append: salePrice+'       ' });

                commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
                commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
                commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
                commandsArray.push({appendBytes:[0x9c]});
                commandsArray.push({ append: amount });
                
                commandsArray.push({append: '\n'});
            }
        }
        commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Right});
        commandsArray.push({ append: 'Total: ' });

        commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
        commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
        commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
        commandsArray.push({appendBytes:[0x9c]});

        commandsArray.push({ append: (nonVatTotal).toFixed(2) });
        commandsArray.push({append: '\n'});
        commandsArray.push({append: '\n'});
        commandsArray.push({append: '\n'});
        commandsArray.push({append: '--------------------------------\n'});
    }

    commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Right});
    commandsArray.push({ append: '  ' });
    commandsArray.push({ append: '  ' });
    commandsArray.push({ append: 'Grand Total: ' });

    commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
    commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
    commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
    commandsArray.push({appendBytes:[0x9c]});

    commandsArray.push({ append: (totalAmount+nonVatTotal).toFixed(2) });        

    commandsArray.push({append: '\n'});
    commandsArray.push({append: '--------------------------------\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});


    if( undeliveredItem != undefined ){
        if(Object.values(undeliveredItem).length > 0){
            commandsArray.push({append: '\n'});
            commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Center});
            commandsArray.push({append: '******* Un Delivered *******'});
            
            commandsArray.push({append: '\n'});
            
            commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
            commandsArray.push({append: 'Item'+'                    '});
            commandsArray.push({append: 'Qty'});
            commandsArray.push({append: '\n'});

            commandsArray.push({append: '--------------------------------\n'});

            for(let i = 0 ; i < Object.values(undeliveredItem).length ; i++){            

                let undeliveredItemPrice = Object.values(undeliveredItem)[i]['sale_item_rel'].name;
                let myQty = (Object.values(undeliveredItem)[i]['qty']);
                    
                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.Left});
                commandsArray.push({append: undeliveredItemPrice+'            '});

                commandsArray.push({appendAlignment: StarPRNT.AlignmentPosition.right});
                commandsArray.push({ append: myQty });
                
                commandsArray.push({append: '\n'});
            }

            // commandsArray.push({appendCodePage:StarPRNT.CodePageType.CP858});
            // commandsArray.push({appendEncoding: StarPRNT.Encoding.USASCII});
            // commandsArray.push({appendInternational: StarPRNT.InternationalType.UK});
            // commandsArray.push({appendBytes:[0x9c]});
            // commandsArray.push({append: '\n'});
            // commandsArray.push({append: '--------------------------------\n'});
        }    
    }

    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    commandsArray.push({append: '\n'});
    print();
};

async function print() {
    try {
        var printResult = await StarPRNT.print('StarPRNT', commandsArray, 'BT:');
        // alert(printResult); // Success!
        setRefreshPage("refresh");

        // navigation.navigate('Dashboard');
        // getListInvoice();

    } catch (e) {
        alert(e);
    }
}

const filterData = (SearchedData) => {
    console.log(parseInt(SearchedData));
    var matched_terms = [];
    var search_term = SearchedData;
    search_term  = search_term.toLowerCase();
   
    if( !isNaN(parseInt(SearchedData))  ){
        for(var i = 0 ; i < updatedData.length ; i++){
            if( updatedData[i].length > 0 ){
                if( 'buyer_rel' in updatedData[i][0] ){
                    if( 'invoice_no' in updatedData[i][0] ){
                        
                        if(updatedData[i][0].invoice_no.indexOf(search_term) !== -1 ){
                            matched_terms.push( updatedData[i] ); 
                        }
                        // SetData([matched_terms])
                        setSelectedLoadCount(matched_terms);
                    }    
                }
            }
        }
    }else{
        console.log("jnk");
        for(var i = 0 ; i < updatedData.length ; i++){
            if( updatedData[i].length > 0 ){
                if( 'buyer_rel' in updatedData[i][0] ){
                    if( 'name' in updatedData[i][0].buyer_rel ){
                        
                        if(updatedData[i][0].buyer_rel.name.toLowerCase().indexOf(search_term) !== -1 ){
                            matched_terms.push( updatedData[i] ); 
                        }
                        // SetData([matched_terms])
                        setSelectedLoadCount(matched_terms);
                    }    
                }
            }
        }
    }

   

    if( SearchedData.length > 0 ){
        
    }else{
        getListInvoice()
    }
}

printDesign = async (data , invoiceNo , buyerName, buyerAddress , buyerPhone) => {
    let totalAmount = 0;

    await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('SUN FARMS\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 3,
            heigthtimes: 3,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('Unit 12C, Bridge Industrial Estate,RH6 9HU\n', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText('Phone: 07917105510\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText('Email: Ekinch2@gmail.com\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.LEFT,
        );
        // await BluetoothEscposPrinter.printText('Price：30\n\r', {});
        await BluetoothEscposPrinter.printText(
            'INVOICE: '+invoiceNo,
            {},
        );
        await BluetoothEscposPrinter.printText(
            '\n\r',
            {},
        );
    await BluetoothEscposPrinter.printText(
        '--------------------------------\n\r',
        {}  ,
    );
    let columnWidthsHeader = [12, 2, 2, 16];
    await BluetoothEscposPrinter.printColumn(
        columnWidthsHeader,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Customer','', '','Date:'+data[0].idate],
        {},
    );
    await BluetoothEscposPrinter.printText(
        '--------------------------------\n\r',
        {}  ,
    );

    let columnWidthsHeaderName = [9, 1, 1, 20];
    await BluetoothEscposPrinter.printColumn(
        columnWidthsHeaderName,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Name:','', '',buyerName],
        {},
    );
    let columnWidthsHeaderAddress = [9,1,1,20];
    await BluetoothEscposPrinter.printColumn(
        columnWidthsHeaderAddress,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Address:','', '',buyerName],
        {},
    );
    let columnWidthsHeaderMobile = [9,1,1,20];
    await BluetoothEscposPrinter.printColumn(
        columnWidthsHeaderMobile,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Phone:','', '',buyerPhone],
        {},
    );
    await BluetoothEscposPrinter.printText(
        '--------------------------------\n\r',
        {},
    );
    await BluetoothEscposPrinter.printText('\n\r', {});

    if(hasVatProduct){
        let columnWidthsHeaderPhone = [5,7,7,7,7];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderPhone,
                [
                    BluetoothEscposPrinter.ALIGN.LEFT,
                    BluetoothEscposPrinter.ALIGN.CENTER,
                    BluetoothEscposPrinter.ALIGN.CENTER,
                    BluetoothEscposPrinter.ALIGN.CENTER,
                    BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Qty', 'Price','Amount','VAT','Total'],
            {},
        );
    
        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );
        let vatAmount = 0;
        let VatProductTotal = 0;
        let beforeVatPrice = 0;
        let columnWidths = [5,7,7,7,7];
        let columnWidthsTotal = [8,2,8,8,7];
        for(let i = 0 ; i < data.length ; i++){
            if( data[i]['sale_item_rel'].itemcategory == 'EGGS' || data[i].has_vat ){
                let sitem       = data[i]['sale_item_rel']['name'];
                let salePrice   = data[i]['sale_price'];
                let qty         = data[i]['qty'];
                let vat = 0;
                let amount = 0;
                if( data[i]['sale_item_rel'].itemcategory != 'EGGS' ){
                    vat = (( (( ( (data[i]['sale_price'] * data[i]['qty']) * 1.20 ) - (data[i]['sale_price'] * data[i]['qty']))) ).toFixed(2)).toString();
    
                    vatAmount = vatAmount + parseFloat(vat);
                }
                if( data[i]['sale_item_rel'].itemcategory == 'EGGS' ){
                    amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
                }else{
                    amount = (( (data[i]['sale_price'] * data[i]['qty']) * 1.20 ).toFixed(2)).toString();
                    
                }
                beforeVatPrice = (beforeVatPrice + parseFloat((qty*salePrice)));
                totalAmount = (parseFloat(totalAmount)+parseFloat(amount));
    
                await BluetoothEscposPrinter.printerAlign(
                    BluetoothEscposPrinter.ALIGN.LEFT,
                );
                await BluetoothEscposPrinter.printText(
                    sitem,
                    {},
                );
                await BluetoothEscposPrinter.printText(
                    '\n\r',
                    {},
                );
                await BluetoothEscposPrinter.printColumn(
                    columnWidths,
                    [
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                    ],
                    [(qty*1).toFixed(0), '£'+salePrice,'£'+(qty*salePrice).toFixed(2),'£'+vat, '£'+amount],
                { encoding: 'Cp858',codepage: 13,widthtimes: 0.6 , heigthtimes: 0.6 });
                 await BluetoothEscposPrinter.printText(
                    '-------------------------------\n',
                    {},
                );
            }
        }
        // await BluetoothEscposPrinter.printText(
        //     '--------------------------------\n\r',
        //     {},
        // );
        // await BluetoothEscposPrinter.printColumn(
        //     columnWidthsTotal,
        //     [
        //         BluetoothEscposPrinter.ALIGN.LEFT,
        //         BluetoothEscposPrinter.ALIGN.CENTER,
        //         BluetoothEscposPrinter.ALIGN.CENTER,
        //         BluetoothEscposPrinter.ALIGN.CENTER,
        //         BluetoothEscposPrinter.ALIGN.RIGHT,
        //     ],
        //     ["Total: ", '','£'+(beforeVatPrice).toFixed(2),'£'+(vatAmount).toFixed(2), '£'+(beforeVatPrice + vatAmount).toFixed(2)],
        // {encoding: 'Cp858',codepage: 13});
        // await BluetoothEscposPrinter.printText(
        //     '--------------------------------\n\r',
        //     {},
        // );
        // await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.RIGHT,
        );
         await BluetoothEscposPrinter.printText(
                'Amount Before VAT: '+'£'+(beforeVatPrice).toFixed(2),
                 {encoding: 'Cp858',codepage: 13}
            );
            await BluetoothEscposPrinter.printText(
                '\n\r',
                {},
            );

            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.RIGHT,
            );
            // await BluetoothEscposPrinter.printText('Price：30\n\r', {});
            await BluetoothEscposPrinter.printText(
                'VAT: '+'£'+(vatAmount).toFixed(2),
                 {encoding: 'Cp858',codepage: 13}
            );
            await BluetoothEscposPrinter.printText(
                '\n\r',
                {},
            );
            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.RIGHT,
            );
            // await BluetoothEscposPrinter.printText('Price：30\n\r', {});
            await BluetoothEscposPrinter.printText(
                'Total: '+'£'+(beforeVatPrice + vatAmount).toFixed(2),
                 {encoding: 'Cp858',codepage: 13}
            );
            await BluetoothEscposPrinter.printText(
                '\n\r',
                {},
            );
    }
    let columnWidthsVat = [12, 4, 8, 8];
    let nonVatTotal = 0;

    if( hasNonVatProducts ){
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
            );
            await BluetoothEscposPrinter.printText(
                '*************************',
                {encoding: 'GBK',
                codepage: 0,
                widthtimes: 0,
                heigthtimes: 0,
                fonttype: 1
            });
            
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});

        let columnWidthsHeaderPhoneVat = [10,10,10];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderPhoneVat,
                [
                    BluetoothEscposPrinter.ALIGN.LEFT,
                    BluetoothEscposPrinter.ALIGN.LEFT,
                    BluetoothEscposPrinter.ALIGN.CENTER,
                ],
                ['Qty', 'Price','Amount'],
            {},
        );

        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );

        for(let i = 0 ; i < data.length ; i++){
            if( data[i]['sale_item_rel'].itemcategory != 'EGGS' && data[i].has_vat == '0'  ){
                let sitem = data[i]['sale_item_rel']['name'];
                let salePrice = data[i]['sale_price'];
                let qty = data[i]['qty'];
                let amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();
                let vat = 0;


                nonVatTotal = (nonVatTotal + parseFloat(amount));
                await BluetoothEscposPrinter.printerAlign(
                    BluetoothEscposPrinter.ALIGN.LEFT,
                );
                await BluetoothEscposPrinter.printText(
                    sitem,
                    {},
                );
                await BluetoothEscposPrinter.printText(
                    '\n\r',
                    {},
                );

                let columnWidthsVat = [10,10,10];
                await BluetoothEscposPrinter.printColumn(
                    columnWidthsVat,
                    [
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                    ],
                    [(qty*1).toFixed(0), '£'+salePrice,'£'+amount],
                {encoding: 'Cp858',codepage: 13});
                await BluetoothEscposPrinter.printText('\n\r', {});
                
            }
        }
                await BluetoothEscposPrinter.printerAlign(
                    BluetoothEscposPrinter.ALIGN.RIGHT,
                );
                await BluetoothEscposPrinter.printText(
                    'Total: £'+(nonVatTotal).toFixed(2),{ encoding: 'Cp858',codepage: 13 },
                );
                await BluetoothEscposPrinter.printText('\n\r', {});

                await BluetoothEscposPrinter.printText(
                    '--------------------------------\n\r',{}
                );

        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );

    }
    await BluetoothEscposPrinter.printColumn(
        columnWidthsVat,
        [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ['', '', 'Total: ','£'+(totalAmount+nonVatTotal).toFixed(2)],
        {encoding: 'Cp858',codepage: 13
        },
    );

    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});
    await BluetoothEscposPrinter.printText('\n\r', {});

    setPrintingIndicator(false);
}

function searchBuyer(text){
    setSearchFrom(text)
    // searchFrom();
}

function searchData(){
    searchBuyerByInvoiceNumber(searchFrom).then((res) => {
        setSelectedLoadCount(res.data.data);
    });
}


function ViewPrintableReciept(data){
    navigation.navigate('ViewPDF' , { invoiceNo : data[0].invoice_no})
}

return (
    <MainScreen>
        <View style={{height: '90%'}}>
            {(ActInd == true) ?
                <View style={{ flex:1,position:'absolute',justifyContent:'center',height:'100%',width: '100%',backgroundColor: '#ededed',zIndex:9999,opacity: 0.5}} >
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            :
                <View style={styles.itemListSection}>
                    {(printingIndicator)?
                        <View style={{ position: 'absolute',height: win.height,width: win.width,backgroundColor: '#e8e8e8',zIndex: 9999,opacity: 0.5,justifyContent: 'center',alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text>Printing your invoice ,Please wait...</Text>
                        </View>
                    :
                        <View></View>
                    }

                            <TextInput placeholder="Search Buyer By Invoice no" placeholderTextColor="lightgrey" style={styles.textInput} onChange={(value) => { filterData(value.nativeEvent.text) } } />

                    {(!loadedData)?
                        <FlatList
                            contentContainerStyle={{justifyContent: 'space-between'}}
                            data={selectedLoadCount}
                            keyExtractor={(item , index) => index}
                            showsVerticalScrollIndicator ={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <ListComponent item={item} ViewRecieptState={(item) => { ViewPrintableReciept(item) }} PrintReceiptState={(item) => { console.log(item), printReceipt(item) } }/>
                            )}
                        />
                    :
                        <ActivityIndicator size="large" color={Colors.primary} />
                    }
                    
                </View>
            }
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