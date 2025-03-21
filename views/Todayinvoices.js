import React, { Component } from 'react';
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
import { Colors } from './../components/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ListItem, Avatar, Header, Button, Input } from 'react-native-elements';
import MainScreen from '../layout/MainScreen';
import { useState, useEffect } from 'react';
import { generateRandString, getCartItemDetails, getListInvoices, getPendingSales, getVehicle, imagePrefix, updatePaymentStatus } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchBuyerByInvoiceNumber, getSaleItemByInvoice } from '../api/apiService';
import { ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import { BluetoothManager, BluetoothEscposPrinter, BluetoothTscPrinter } from 'tp-react-native-bluetooth-printer';
import { Modal } from 'react-native';

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
let updatedValue = '';
let initalPaymentStatus = 'cash';

export default function Todayinvoices({ navigation }) {
    const [data, setData] = useState();
    // const [totalAmount, setTotalAmount] = useState();
    const [loadedData, setLoadedData] = useState();
    const [updatedData, setUpdatedData] = useState();
    const [creditData, setCreditData] = useState();
    const [undeliveredData, setUndeliveredData] = useState();
    const [loadedActivityIndicator, setLoadedActivityIndicator] = useState(false);
    const [printingIndicator, setPrintingIndicator] = useState(false);
    const [ActInd, setActInd] = useState(false);
    const [creaditStatus, setCreditStatus] = useState(initalPaymentStatus);
    const [saveOrderActivIndictor, setSaveOrderActivIndictor] = useState(false);
    const [selectedLoadCount, setSelectedLoadCount] = useState();
    const [device, setDevice] = useState();
    const [isBluetoothEnabled, setisBluetoothEnabled] = useState(false);
    const [model, showModel] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [invoice, setInvoice] = useState();
    const [status, setStatus] = useState();

    const ref_input2 = useRef();
    var paired = [];

    useEffect(() => {
        getlist()
    }, [])
    function getlist() {
        AsyncStorage.getItem('selectedVehicleNo').then((vehicheId) => {
            AsyncStorage.getItem('user_id').then((driverId) => {
                AsyncStorage.getItem('selectedRoute').then((route) => {

                    getPendingSale({ "route": route, "driver": driverId, "vehicle": vehicheId })
                });
            });
        });
    }

    // function getListInvoice(){
    //     AsyncStorage.getItem('selectedVehicleNo').then((value) => {
    // 		let selectedVehNo  = value;
    // 		AsyncStorage.getItem('user_id').then((value) => {
    // 			let driverId =  value;
    //             getListInvoices(driverId , selectedVehNo).then((data) => {
    //                 setSelectedLoadCount(data.data.data)
    //             });
    // 		});
    // 	});
    // }

    function getPendingSale({ "route": route, "driver": driverId, "vehicle": vehicheId }) {
        return new Promise((resolve, reject) => {
            getPendingSales({ "route": route, "driver": driverId, "vehicle": vehicheId }).then((res) => {
                setCreditData(res.data.deliverdSales)
                setUndeliveredData(res.data.nonDeliverdSales)
                setActInd(false)
                showModel(false)
            }, (err) => {
                showToast('no records available')
            });
        })
    }

    function getSaleItemByInv(invoiceNo) {
        return new Promise((resolve, reject) => {
            getSaleItemByInvoice(invoiceNo).then((res) => {
                resolve(res.data.data);
            });
        }, (err) => {
            reject(err)
        })
    }

    printReceipt = (data) => {
        setPrintingIndicator(true);
        let buyerName = data[0]['buyer_rel'].name;
        let buyerAddress = data[0]['buyer_rel'].address;
        let buyerPhone = data[0]['buyer_rel'].contact_no;
        let invoiceNo = data[0].invoice_no;

        getSaleItemByInv(invoiceNo).then((res) => {
            if (device != undefined) {
                BluetoothManager.connect(device).then((ress) => {
                    printDesign(Object.values(res), invoiceNo, buyerName, buyerAddress, buyerPhone);
                }, (e) => {
                    alert(e);
                    setPrintingIndicator(false);
                });
            } else {
                alert('printer not connected');
                setPrintingIndicator(false);
            }
        }, (error) => {
            alert(error);
        });
    };
    printDesign = async (data, invoiceNo, buyerName, buyerAddress, buyerPhone) => {
        let totalAmount = 0;

        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('Unit 4\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 3,
            heigthtimes: 3,
            fonttype: 1,
        });
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('94 Staceway Worth, Crawley, RH107YR\n\r', {
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
            'INVOICE: ' + invoiceNo,
            {},
        );
        await BluetoothEscposPrinter.printText(
            '\n\r',
            {},
        );
        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
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
            ['Customer', '', '', 'Date:'],
            {},
        );
        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
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
            ['Name:', '', '', buyerName],
            {},
        );
        let columnWidthsHeaderAddress = [9, 1, 1, 20];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderAddress,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Address:', '', '', buyerAddress],
            {},
        );
        let columnWidthsHeaderMobile = [9, 1, 1, 20];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderMobile,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Phone:', '', '', buyerPhone],
            {},
        );
        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(
            'Items without VAT',
            {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 0,
                heigthtimes: 0,
                fonttype: 1
            }
        );
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});

        let columnWidthsHeaderPhone = [12, 4, 8, 8];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderPhone,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Items', 'Qty', 'Price', 'Amount'],
            {},
        );

        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );
        let columnWidths = [12, 4, 8, 8];
        for (let i = 0; i < data.length; i++) {
            if (data[i]['sale_item_rel'].itemcategory == 'EGGS') {
                let sitem = data[i]['sale_item_rel']['name'];
                let salePrice = data[i]['sale_price'];
                let qty = data[i]['qty'];
                let amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();

                totalAmount = (parseFloat(totalAmount) + parseFloat(amount));

                await BluetoothEscposPrinter.printColumn(
                    columnWidths,
                    [
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.RIGHT,
                    ],
                    [sitem, qty, '$' + salePrice, '$' + amount],
                    {});
                await BluetoothEscposPrinter.printText('\n\r', {});
            }
        }

        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(
            '*************************',
            {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 0,
                heigthtimes: 0,
                fonttype: 1
            });

        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(
            'Items with VAT',
            {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 0,
                heigthtimes: 0,
                fonttype: 1
            }
        );
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});

        let columnWidthsHeaderPhoneVat = [12, 4, 8, 8];
        await BluetoothEscposPrinter.printColumn(
            columnWidthsHeaderPhoneVat,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Items', 'Qty', 'Price', 'Amount'],
            {},
        );

        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );
        let columnWidthsVat = [12, 4, 8, 8];
        for (let i = 0; i < data.length; i++) {
            if (data[i]['sale_item_rel'].itemcategory != 'EGGS') {
                let sitem = data[i]['sale_item_rel']['name'];
                let salePrice = data[i]['sale_price'];
                let qty = data[i]['qty'];
                let amount = ((data[i]['sale_price'] * data[i]['qty']).toFixed(2)).toString();

                totalAmount = (parseFloat(totalAmount) + parseFloat(amount));

                await BluetoothEscposPrinter.printColumn(
                    columnWidthsVat,
                    [
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.LEFT,
                        BluetoothEscposPrinter.ALIGN.CENTER,
                        BluetoothEscposPrinter.ALIGN.RIGHT,
                    ],
                    [sitem, qty, '$' + salePrice, '$' + amount],
                    {});
                await BluetoothEscposPrinter.printText('\n\r', {});
            }
        }


        await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
        );
        await BluetoothEscposPrinter.printColumn(
            columnWidthsVat,
            [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['', '', 'Total: ', '$' + (totalAmount)],
            {
            },
        );

        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText('\n\r', {});

        setPrintingIndicator(false);
    }
    function gotoCart(invoiceNo, selectedBuyer) {
        setActInd(true)
        getSaleItemByInvoice(invoiceNo).then((data) => {
            setActInd(false)
            AsyncStorage.setItem('cartItems', JSON.stringify(data.data.data));

            AsyncStorage.setItem('selectedInvoiceId', invoiceNo);
            AsyncStorage.setItem('selectedBuyer', (selectedBuyer).toString());
            AsyncStorage.getItem('selectedBuyer').then((buyerId) => {
                let myRecords = {};
                let myRecordsFinal = {};
                let relData = data.data.data;
                if (data != undefined) {
                    for (let i = 0; i < relData.length; i++) {

                        let dnum = relData[i].dnum;
                        let sitem = relData[i].sitem;
                        let qty = relData[i].qty;

                        myRecords[relData[i].dnum + '_' + relData[i].sitem] = qty;
                        myRecordsFinal[relData[i].dnum + '__' + relData[i].sitem] = { 'buyerId': buyerId, 'value': JSON.parse(qty), 'cardId': relData[i].sitem, 'VATstatus': false };
                        AsyncStorage.setItem('undeliveredItems', JSON.stringify(myRecordsFinal))
                        AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify(myRecordsFinal))
                        AsyncStorage.setItem('itemsAddedInCart', JSON.stringify(myRecords))
                    }
                }
                navigation.push('ItemsScreenWithQty', { mySelectedItems: myRecordsFinal });
                // navigation.push('AddQuantity' , { mySelectedItems: myRecordsFinal});

            });
        })
    }
    function searchBuyer(text) {
        // setActInd(true)
        searchBuyerByInvoiceNumber(text).then((res) => {
            setSelectedLoadCount(res.data.data)
            // setActInd(false)
        })
    }

    function showDropdown(invoiceNo) {
        if (selectedPerson == invoiceNo) {
            setSelectedPerson('');
        } else {
            setSelectedPerson(invoiceNo)
        }
        // showModel(true)
    }

    function printData(data) {

    }

    function ViewPrintableReciept(invoiceNo) {
        navigation.navigate('ViewPDF', { invoiceNo: invoiceNo })
    }

    function changeStatus() {
        showModel(true);
        setModalVisible(false)
        updatePaymentStatus(invoice, status).then((res) => {
            getlist();
        }, (err) => {

            showModel(false);
        })
    }
    function showModels(invoiceNo, status) {
        setInvoice(invoiceNo)
        setStatus(status)
        setModalVisible(true)
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
                        <Text style={{ fontSize: 17, paddingHorizontal: 10 }}>Are you sure you want to change the status of invoice.?</Text>
                        <View style={{ flexDirection: 'row', width: '90%', marginTop: 10, justifyContent: 'space-between' }}>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={{ backgroundColor: 'red', borderRadius: 2, color: 'white', paddingVertical: 10, paddingHorizontal: 13, elevation: 5 }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => changeStatus()}
                            >
                                <Text style={{ backgroundColor: Colors.primary, borderRadius: 2, color: 'white', paddingVertical: 10, paddingHorizontal: 13, elevation: 5 }}>Continue</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={{ flex: 1 }}>
                {(ActInd == true) ?
                    <View style={{ flex: 1, position: 'absolute', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#ededed', zIndex: 9999, opacity: 0.5 }} >
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                    :
                    <View style={styles.itemListSection}>

                        {(printingIndicator) ?
                            <View style={{ position: 'absolute', height: win.height, width: win.width, backgroundColor: '#e8e8e8', zIndex: 9999, opacity: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text>Printing your invoice ,Please wait...</Text>
                            </View>
                            :
                            <View></View>
                        }
                        {/* <TextInput placeholder="Search Buyer By Invoice no" placeholderTextColor="lightgrey" style={styles.textInput} onChange={(value) => { searchBuyer(value.nativeEvent.text) } } /> */}

                        <ScrollView vertical='true'>
                            {(creditData != undefined && creditData != null) ?
                                <View>
                                    <Text style={{ marginLeft: 15, fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>Pending Payments</Text>
                                </View>
                                :
                                <View></View>
                            }
                            {(creditData != undefined && creditData != null) ?

                                Object.values(creditData).map((l, i) => (
                                    (l != null) ?
                                        <TouchableHighlight key={i}>
                                            <ListItem bottomDivider key={i} >
                                                <ListItem.Content key={i} >
                                                    <ListItem.Title key={i} style={{ fontSize: 14 }} allowFontScaling={false}>
                                                        {l[0]["buyer_rel"].name}
                                                    </ListItem.Title>
                                                    <ListItem.Subtitle allowFontScaling={false} >
                                                        <Text style={{ fontSize: 10 }}>{l[0].invoice_no}</Text>
                                                    </ListItem.Subtitle>
                                                </ListItem.Content>
                                                <View>
                                                    <Pressable style={{ width: 60, backgroundColor: 'lightgreen', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 5, alignItems: 'center' }} onPress={() => { ViewPrintableReciept(l[0].invoice_no) }} >
                                                        <Text style={{ color: 'white' }}>View</Text>
                                                    </Pressable>
                                                </View>
                                                <View style={{ flexDirection: 'column' }}>
                                                    <View style={{}}>
                                                        <Pressable style={{ width: 80, backgroundColor: 'red', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 5 }} onPress={() => { showDropdown(l[0].invoice_no) }} >
                                                            <Text style={{ color: 'white' }}>un-settled</Text>
                                                        </Pressable>
                                                    </View>
                                                    {(selectedPerson == l[0].invoice_no) ?
                                                        <View style={{ backgroundColor: 'white', elevation: 5, padding: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', width: 250, top: 10, right: 0, zIndex: 99999 }}>
                                                            <Pressable onPress={() => { showModels(l[0].invoice_no, 'cash') }}>
                                                                <Text >Cash Recieved</Text>
                                                            </Pressable>
                                                            <Text style={{ borderRightColor: '#ededed', borderRightWidth: 1 }}></Text>
                                                            <Pressable onPress={() => { showModels(l[0].invoice_no, 'bank_transfer') }}>
                                                                <Text>Bank Transfer Recieved</Text>
                                                            </Pressable>
                                                        </View>
                                                        :
                                                        <View></View>
                                                    }
                                                </View>
                                            </ListItem>
                                        </TouchableHighlight>
                                        :
                                        <View></View>
                                ))
                                :
                                <View>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                </View>
                            }

                            {(undeliveredData != undefined && undeliveredData != null) ?
                                <View>
                                    <Text style={{ marginLeft: 15, fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>Pending Deliveries</Text>
                                </View>
                                :
                                <View></View>
                            }

                            {(undeliveredData != undefined && undeliveredData != null) ?
                                Object.values(undeliveredData).map((l, i) => (
                                    (l != null) ?
                                        <TouchableHighlight key={i}>
                                            <ListItem bottomDivider key={i} >
                                                <ListItem.Content key={i} >
                                                    <ListItem.Title key={i} style={{ fontSize: 14 }} allowFontScaling={false}>
                                                        {l[0]["buyer_rel"].name}
                                                    </ListItem.Title>
                                                    <ListItem.Subtitle allowFontScaling={false} >
                                                        <Text style={{ fontSize: 10 }}>{l[0].dnum}</Text>
                                                    </ListItem.Subtitle>
                                                </ListItem.Content>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View>
                                                        <Pressable style={{ width: 60, backgroundColor: 'lightgreen', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 5, alignItems: 'center' }} onPress={() => { ViewPrintableReciept(l[0].invoice_no) }} >
                                                            <Text style={{ color: 'white' }}>View</Text>
                                                        </Pressable>
                                                    </View>
                                                    <View style={{ flexDirection: 'column', marginLeft: 15 }}>
                                                        <Pressable style={{ textAlign: 'center', justifyContent: 'center', width: 80, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 2, borderRadius: 5 }} onPress={() => { gotoCart(l[0].invoice_no, l[0]["buyer_rel"].id) }} >
                                                            <Text style={{ color: 'white', textAlign: 'center' }}>Cart</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            </ListItem>
                                        </TouchableHighlight>
                                        :
                                        <View></View>
                                ))
                                :
                                <View>
                                    {/* <ActivityIndicator size="large" color={Colors.primary} /> */}
                                </View>
                            }
                        </ScrollView>
                    </View>
                }
                {(model) ? <View style={{ backgroundColor: '#ededed', flex: 1, position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', opacity: 0.5 }}><Text style={{ textAlign: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></Text></View> : <View></View>}

            </View>
        </MainScreen>
    );
}

const styles = StyleSheet.create({
    vehicleImage: { width: 50, height: 50, resizeMode: 'contain' },
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
        borderColor: Colors.primary,
        borderWidth: 2
    },
    deActiveStatus: {
        paddingHorizontal: 18,
        borderRadius: 15,
        paddingVertical: 10,
        marginHorizontal: 10,
        borderColor: Colors.primary,
        borderWidth: 2
    },
    activeStatusText: {
        color: 'white'
    },
    deActiveStatusText: {
        color: Colors.primary
    },
    textInput: {
        borderColor: 'lightgrey',
        borderWidth: 1,
        marginHorizontal: 17,
        paddingHorizontal: 17,
        borderRadius: 100,
        color: '#000'
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