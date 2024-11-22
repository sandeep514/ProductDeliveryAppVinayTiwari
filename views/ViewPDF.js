import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View, ToastAndroid, Keyboard, Pressable, ActivityIndicator, ScrollView, Dimensions, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useRef } from 'react';
import { BeforeOrderDetails, getDiverId, getSaleItemByInvoice, printing, SaveOrder } from '../api/apiService';
import { Colors } from './../components/Colors';
import { Button } from 'react-native-elements';

let totalAmount = 0;

export default function ViewPDF({ navigation, route, text, onOK }) {
    var totalAmountVat = 0;
    var totalAmountWithoutVat = 0;
    var AmountVat = 0;
    let commandsArray = [];

    const ref = useRef();
    const win = Dimensions.get('window');

    const [savedOrderResonce, setSavedOrderResponce] = useState();
    const [hasNonVatProducts, setHasNonVatProducts] = useState(false);
    const [hasVatProducts, setHasVatProducts] = useState(false);
    const [printingIndicator, setPrintingIndicator] = useState(false);

    const [savedBuyerData, setSavedBuyerData] = useState();
    const [showVAT, setShowVAT] = useState(false);
    const [saveOrderActivIndictor, setSaveOrderActivIndictor] = useState(false);
    const [VatProductTotal, setVatProductTotal] = useState(0);
    const [VATTotal, setVATTotal] = useState(0);
    const [WithoutVatProductTotal, setWithoutVatProductTotal] = useState(0);
    const [invoiceNumber, setInvoiceNumber] = useState();
    const [undeliveredItems, setundeliveredItems] = useState();
    const [selectedDriverId, setselectedDriverId] = useState();
    const [loader, setLoader] = useState(false);


    let setBase64Image = '';
    function getSaleItemByInv(invoiceNo) {
        setLoader(true)
        return new Promise((resolve, reject) => {
            getSaleItemByInvoice(invoiceNo).then((res) => {

                resolve(res.data);

                setLoader(false)
            });
        }, (err) => {
            reject(err)
        })
    }
    useEffect(() => {
        setInvoiceNumber(route.params.invoiceNo);

        AsyncStorage.getItem('user_id').then((driverId) => {
            setselectedDriverId(driverId)
        });

        getSaleItemByInv(route.params.invoiceNo).then((result) => {
            setSavedBuyerData(result.data[0].buyer_rel);
            let parsedData = result.data;

            setSavedOrderResponce(parsedData);

            setundeliveredItems(result.undeliverdItems)
            for (let i = 0; i < parsedData.length; i++) {

                if (parsedData[i]['has_vat'] == 1 || parsedData[i]['sale_item_rel']['category_name'] == 'EGGS') {
                    if (parsedData[i]['sale_item_rel']['category_name'] == 'EGGS') {
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];

                        // setVatProductTotal( (parseFloat(VatProductTotal) + (parseFloat(qty)*parseFloat(sale_price))) );
                        totalAmountVat = (parseFloat(totalAmountVat) + (parseFloat(qty) * parseFloat(sale_price)))
                        AmountVat = (parseFloat(AmountVat) + (parseFloat(qty) * parseFloat(sale_price)))

                        setVatProductTotal(totalAmountVat);
                        setVATTotal(AmountVat)
                    }
                    if (parsedData[i]['has_vat'] == 1) {
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];
                        let totalPriceAfterVAT = (((qty * sale_price) * 1.20));
                        let amount = (qty * sale_price);

                        AmountVat = (parseFloat(AmountVat) + (parseFloat(qty) * parseFloat(sale_price)))
                        totalAmountVat = (parseFloat(totalAmountVat) + parseFloat(totalPriceAfterVAT))

                        setVatProductTotal(totalAmountVat);
                        setVATTotal(AmountVat)

                    }
                }

                if (parsedData[i]['has_vat'] == 0 && parsedData[i]['sale_item_rel']['category_name'] != 'EGGS') {

                    if (parsedData[i]['has_vat'] == 0) {
                        let qty = parsedData[i]['qty'];
                        let sale_price = parsedData[i]['sale_price'];
                        let totalPriceAfterVAT = ((qty * sale_price));

                        totalAmountWithoutVat = (parseFloat(totalAmountWithoutVat) + parseFloat(totalPriceAfterVAT))
                        setWithoutVatProductTotal(totalAmountWithoutVat)
                    }
                }

                if (parsedData[i]['sale_item_rel']['category_name'] == 'EGGS' || parsedData[i]['sale_item_rel']['category_name'] == 'eggs' || parsedData[i].has_vat == 1) {
                    setHasVatProducts(true);
                } else {
                    setHasNonVatProducts(true);
                }

                let amount = ((parsedData[i]['sale_price'] * parsedData[i]['qty']).toFixed(2)).toString();
                totalAmount = (parseFloat(totalAmount) + parseFloat(amount));
            }
            setSavedOrderResponce(parsedData);

        })

        AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({}));
        AsyncStorage.getItem('currentVATstatus').then((res) => {
            if (res == '1') {
                setShowVAT(true);
            } else {
                setShowVAT(false);
            }
        });
        totalAmountVat = 0;
        AmountVat = 0;
        totalAmountWithoutVat = 0;

    }, []);

    const printReceiptInvoice = () => {
        setPrintingIndicator(true);
        let buyerName = savedOrderResonce[0]['buyer_rel'].name;
        let buyerAddress = savedOrderResonce[0]['buyer_rel'].address;
        let buyerPhone = savedOrderResonce[0]['buyer_rel'].contact_no;
        let invoiceNo = invoiceNumber;


        AsyncStorage.getItem('user_id').then((res) => {
            setPrintingIndicator(true);

            getDiverId(res).then((printerName) => {
                if (printerName.printerType == 'star') {
                    if (res != null && res != undefined) {
                        getSaleItemByInv(invoiceNo).then((res) => {
                            for (let i = 0; i < res.length; i++) {
                                if (res[i]['sale_item_rel'].itemcategory == 'EGGS' || res[i].has_vat) {
                                    setHasVatProducts(true)
                                }
                                if (res[i]['sale_item_rel'].itemcategory != 'EGGS' && !res[i].has_vat) {
                                    setHasNonVatProducts(true)
                                }
                            }

                            // printDesignStarPrinter( Object.values(res) , invoiceNo , buyerName ,buyerAddress , buyerPhone );
                            printing(Object.values(res.data), invoiceNo, buyerName, buyerAddress, buyerPhone, undeliveredItems, hasVatProducts, hasNonVatProducts);
                            setTimeout(() => {
                                setPrintingIndicator(false);
                            }, 8000)
                            setPrintingIndicator(false);

                        }, (error) => {
                            alert(error);
                        });
                    }
                } else {
                    BluetoothManager.isBluetoothEnabled().then((enabled) => {
                        BluetoothManager.enableBluetooth().then((r) => {

                            setisBluetoothEnabled(true)
                            if (r != undefined) {
                                for (let i = 0; i < r.length; i++) {

                                    AsyncStorage.getItem('printerName').then((res) => {
                                        if (res != null && res != undefined) {
                                            if (JSON.parse(r[i]).name == printerName) {
                                                paired.push(JSON.parse(r[i]).name);
                                                setDevice(JSON.parse(r[i]).address)

                                                getSaleItemByInv(invoiceNo).then((res) => {
                                                    for (let i = 0; i < res.length; i++) {
                                                        if (res[i]['sale_item_rel'].itemcategory == 'EGGS' || res[i].has_vat) {
                                                            setHasVatProducts(true)
                                                        }
                                                        if (res[i]['sale_item_rel'].itemcategory != 'EGGS' && !res[i].has_vat) {
                                                            setHasNonVatProducts(true)
                                                        }
                                                    }
                                                    BluetoothManager.connect(JSON.parse(r[i]).address).then((ress) => {
                                                        printDesign(Object.values(res), invoiceNo, buyerName, buyerAddress, buyerPhone);
                                                        setPrintingIndicator(false);
                                                    }, (e) => {
                                                        alert(e)
                                                        setPrintingIndicator(false);
                                                    });
                                                }, (error) => {
                                                    alert(error);
                                                });
                                            }
                                        } else {
                                            alert('No Printer available');
                                        }

                                    })
                                }
                            } else {
                                alert('No Device detected');
                            }

                        }, (err) => {
                            alert(err);
                        });
                    },
                        (err) => {
                            alert(err);
                        },
                    );
                }
            })
        })
    };
    function handleBackButtonClick() {
        navigation.navigate('Dashboard');
    }
    function parseIntt(string) {
        return parseInt(string);
    }

    function parseFloatt(string) {
        return parseFloat(string);
    }

    return (
        <View style={styles.bodyContainer}>
            {(win.width > 550) ?
                (loader) ?
                    <ActivityIndicator size={35} color={Colors.primary}></ActivityIndicator>
                    :
                    <View >
                        <View style={{ flexDirection: 'row', height: '100%' }}>
                            <View style={{ width: '50%' }} >
                                <ScrollView>
                                    <View >
                                        <Text style={{ fontSize: 20, color: 'black', fontWeight: '700', backgroundColor: 'white', textAlign: 'center' }}>
                                            Invoice
                                        </Text>
                                        <Text style={{ fontSize: 30, textAlign: 'center' }}>Unit 4</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Burstow business lodge</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Smallfield</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'center' }}>RH69RF</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Phone: 07917105510</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'center' }}>Email: Ukinch2@gmail.com</Text>
                                        <Text style={{ fontSize: 15, textAlign: 'left', marginLeft: 20 }}>INVOICE: {(invoiceNumber != undefined) ? invoiceNumber : ''}</Text>
                                        <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, borderBottomColor: 'black', borderTopColor: 'black', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                            <Text style={{ fontWeight: 'bold', width: 100 }}>Customer</Text>
                                            <Text style={{ fontWeight: 'bold' }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}>Date: {(savedOrderResonce != undefined) ? savedOrderResonce[0]['idate'] : ''}</Text>
                                        </View>
                                        <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                            <Text style={{ width: 100 }}>Name: </Text>
                                            <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['name'] : ''} </Text>
                                        </View>
                                        <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                            <Text style={{ width: 100 }}>Address: </Text>
                                            <Text style={{ textAlign: 'left' }}>{(savedBuyerData != undefined) ? savedBuyerData['address'] : ''} </Text>
                                        </View>
                                        <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                            <Text style={{ width: 100 }}>Phone: </Text>
                                            <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['contact_no'] : ''} </Text>
                                        </View>
                                        {(hasVatProducts) ?
                                            <View>
                                                {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items without VAT</Text></View> */}
                                                <View style={{ flex: 0.2, borderTopColor: 'black', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomColor: 'black', marginTop: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                                    <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                                    <Text style={{ fontWeight: 'bold' }}>Amount</Text>
                                                    <Text style={{ fontWeight: 'bold' }}>VAT</Text>
                                                    <Text style={{ fontWeight: 'bold' }}>Total(inc)</Text>
                                                </View>
                                                <View style={{ marginTop: 10 }}>
                                                </View>
                                            </View>
                                            :
                                            <View></View>
                                        }

                                        {(savedOrderResonce != undefined) ?
                                            savedOrderResonce.map((value, key) => {
                                                return (
                                                    <View key={key} >
                                                        {(value['sale_item_rel'].category_name == 'EGGS') ?
                                                            <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                    <Text style={{}}>{parseFloatt(value['qty'])}</Text>
                                                                    <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                    <Text style={{}}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{}}>£ 0</Text>
                                                                    <Text style={{}}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                                </View>
                                                            </View>
                                                            :
                                                            <View></View>
                                                        }
                                                        {(value['sale_item_rel'].category_name != 'EGGS' && value.has_vat) ?
                                                            <View>
                                                                <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                                    <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                    <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                        {/* <Text style={{ width: 90}}>{value['sale_item_rel'].name}</Text> */}
                                                                        <Text style={{}}>{parseFloatt(value['qty'])}</Text>
                                                                        <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                        <Text style={{}}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                        <Text style={{}}>£{((((parseFloatt(value['qty']) * value['sale_price']) * 1.20)) - (parseFloatt(value['qty']) * value['sale_price'])).toFixed(2)}</Text>
                                                                        <Text style={{}}>£{(parseFloat((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)) * 1.20).toFixed(2)}</Text>
                                                                    </View>
                                                                </View>
                                                                {/* <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                                                    <Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                                    <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                                </View> */}
                                                            </View>
                                                            :
                                                            <View></View>
                                                        }
                                                    </View>
                                                )
                                            })

                                            :
                                            <View></View>
                                        }
                                        {(hasNonVatProducts) ?
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                                                    <Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}>Amount Before VAT:</Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                    <Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}>VAT:</Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VatProductTotal - VATTotal).toFixed(2)}</Text></Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                    <Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}>Total:</Text></Text>
                                                    <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                </View>
                                            </View>
                                            :
                                            <View></View>
                                        }

                                        {(WithoutVatProductTotal > 0) ?
                                            <View>
                                                <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 10 }}> ******************************* </Text>
                                                <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', borderTopColor: 'black', borderTopWidth: 1, paddingHorizontal: 20, borderBottomColor: 'black', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                                    <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                                    {/* <Text style={{fontWeight: 'bold'}}>VAT</Text> */}
                                                    <Text style={{ fontWeight: 'bold' }}>Amt(inc)</Text>
                                                </View>
                                                <View style={{ marginTop: 10 }}>
                                                </View>
                                            </View>
                                            :
                                            <View></View>
                                        }

                                        {(savedOrderResonce != undefined) ?
                                            savedOrderResonce.map((value, key) => {

                                                return (
                                                    <View key={key} >
                                                        {(value['sale_item_rel'].category_name != 'EGGS' && !value.has_vat) ?
                                                            <View key={key} style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}></Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                    <Text style={{}}>{(parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                    {/* <Text style={{ }}>£ 0</Text> */}
                                                                    <Text style={{}}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                                </View>
                                                                {/* <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                                    <Text style={{ width: 90}}>{}</Text>
                                                                    <Text style={{ }}>{}</Text>
                                                                    <Text style={{ fontWeight: 'bold'}}>VAT</Text>
                                                                    <Text style={{ }}>£{((value['sale_price']*100) / 120).toFixed(2)}</Text>
                                                                </View> */}

                                                            </View>
                                                            :
                                                            <View></View>
                                                        }
                                                    </View>
                                                )
                                            })
                                            :
                                            <View></View>
                                        }
                                        {(WithoutVatProductTotal > 0) ?
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text> £{(totalAmountWithoutVat).toFixed(2)}</Text> */}
                                                <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}>Total: £{(WithoutVatProductTotal).toFixed(2)}</Text></Text>
                                            </View>
                                            :
                                            <View></View>
                                        }
                                        <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 }}>
                                            <Text style={{ fontWeight: 'bold', width: 100 }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}>Grand Total:</Text>
                                            <Text style={{ fontWeight: 'bold' }}>£{(VatProductTotal + WithoutVatProductTotal).toFixed(2)}</Text>
                                        </View>
                                        <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 }}>
                                            <Text style={{ fontWeight: 'bold', width: 100 }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}></Text>
                                            <Text style={{ fontWeight: 'bold' }}>Remarks:</Text>
                                            <Text style={{ fontWeight: 'bold' }}>{(savedOrderResonce != undefined) ? savedOrderResonce[0]?.sale_signature_remarks?.remarks : ''}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, width: '100%' }}>
                                            <Text style={{ fontWeight: 'bold', width: '20%' }}>Signature:</Text>
                                            {(savedOrderResonce != undefined) ?
                                                <Image style={{ width: '70%', height: 200 }} source={{ uri: `data:image/jpeg;base64,${savedOrderResonce[0]?.sale_signature_remarks?.signature}` }} />

                                                : null}
                                        </View>
                                    </View>
                                </ScrollView>

                            </View>
                            <View style={{ width: '50%' }}>
                                {/* <View style={{ flex: 2.5 ,width: '100%' }}>
                                <Text style={{fontSize: 20, color: 'black', fontWeight: '700',backgroundColor: 'lightgrey',textAlign: 'center'}}>
                                    Signature
                                </Text>
                                <View style={styles.container}>
                                    <SignatureScreen
                                        ref={ref}
                                        onOK={handleSignature} 
                                    />
                                
                                </View>
                            </View> */}

                                {/* <View  style={{ flex: 1 ,width: '100%' }}>
                                <Text style={{fontSize: 20, color: 'black', fontWeight: '700',backgroundColor: 'lightgrey',textAlign: 'center'}}>
                                    Remarks
                                </Text>
                                <Input row="4" placeholder="Add Remarks" value={remarks} allowFontScaling={false} onChange={(value) => {setRemarks(value.nativeEvent.text)}}/>
                            </View> */}
                                <View style={{ flex: 1, width: '100%' }}>
                                    {/* <Button title="Print" onPress={() => { printReceipt() }} />
                                {(saveOrderActivIndictor)? <ActivityIndicator color="white" size="large" /> : <View></View>} */}
                                    {/* <ActivityIndicator  color={Colors.primary} size="large" /> */}
                                    {/* {(saveOrderActivIndictor)? <ActivityIndicator  color={Colors.primary} size="large" /> :  */}

                                    <View style={{ flexDirection: 'column' }}>
                                        {/* <Pressable  onPress={() => {portDiscovery()}} style={{backgroundColor: 'black',padding: 10,marginBottom: 20}} ><Text style={{color: 'white',textAlign: 'center'}}>Get Ports</Text></Pressable>
                                    <Pressable  onPress={() => {connect()}}  style={{backgroundColor: 'black',padding: 10,marginBottom: 20}}><Text style={{color: 'white',textAlign: 'center'}}>Connect</Text></Pressable> */}
                                        <Button title="Print" onPress={() => { setSaveOrderActivIndictor(true); printReceiptInvoice() }} />
                                        {/* <Button title="Print2" onPress={() => { setSaveOrderActivIndictor(true);  printReceipt2() }} /> */}
                                    </View>


                                </View>

                                <View style={{ flex: 2 }}></View>

                            </View>
                        </View>
                    </View>

                :
                (loader) ?
                    <ActivityIndicator size={35} color={Colors.primary}></ActivityIndicator>
                    :
                    <View style={{ flex: 1 }}>
                        <View style={{ height: '100%', width: '100%' }}>
                            <ScrollView>
                                <View >
                                    <Text style={{ fontSize: 20, color: 'black', fontWeight: '700', backgroundColor: 'white', textAlign: 'center' }}>
                                        Invoice
                                    </Text>
                                    <Text style={{ fontSize: 30, textAlign: 'center' }}>Unit 4</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>Burstow business lodge</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>Smallfield</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>RH69RF</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>Phone: 07917105510</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>Email: Ukinch2@gmail.com</Text>
                                    <Text style={{ fontSize: 15, textAlign: 'left', marginLeft: 20 }}>INVOICE: {(invoiceNumber != undefined) ? invoiceNumber : ''}</Text>
                                    <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, borderBottomColor: 'black', borderTopColor: 'black', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                        <Text style={{ fontWeight: 'bold', width: 100 }}>Customer</Text>
                                        <Text style={{ fontWeight: 'bold' }}></Text>
                                        <Text style={{ fontWeight: 'bold' }}></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Date: {(savedOrderResonce != undefined) ? savedOrderResonce[0]['ddate'] : ''}</Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                        <Text style={{ width: 100 }}>Name: </Text>
                                        <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['name'] : ''} </Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                        <Text style={{ width: 100 }}>Address: </Text>
                                        <Text style={{ textAlign: 'left' }}>{(savedBuyerData != undefined) ? savedBuyerData['address'] : ''} </Text>
                                    </View>
                                    <View style={{ flex: 0.2, flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 }}>
                                        <Text style={{ width: 100 }}>Phone: </Text>
                                        <Text style={{}}>{(savedBuyerData != undefined) ? savedBuyerData['contact_no'] : ''} </Text>
                                    </View>
                                    {(hasVatProducts) ?
                                        <View>
                                            {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items without VAT</Text></View> */}
                                            <View style={{ flex: 0.2, borderTopColor: 'black', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomColor: 'black', marginTop: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                                <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                                <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                                <Text style={{ fontWeight: 'bold' }}>Amount</Text>
                                                <Text style={{ fontWeight: 'bold' }}>VAT</Text>
                                                <Text style={{ fontWeight: 'bold' }}>Total(inc)</Text>
                                            </View>
                                            <View style={{ marginTop: 10 }}>
                                            </View>
                                        </View>
                                        :
                                        <View></View>
                                    }

                                    {(savedOrderResonce != undefined) ?
                                        savedOrderResonce.map((value, key) => {
                                            return (
                                                <View key={key} >
                                                    {(value['sale_item_rel'].category_name == 'EGGS') ?
                                                        <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                            <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                            <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                <Text style={{}}>{parseFloatt(value['qty'])}</Text>
                                                                <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                <Text style={{}}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                <Text style={{}}>£ 0</Text>
                                                                <Text style={{}}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                            </View>
                                                        </View>
                                                        :
                                                        <View></View>
                                                    }
                                                    {(value['sale_item_rel'].category_name != 'EGGS' && value.has_vat) ?
                                                        <View>
                                                            <View style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                                <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}> </Text>{value['sale_item_rel'].name}</Text>
                                                                <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                    {/* <Text style={{ width: 90}}>{value['sale_item_rel'].name}</Text> */}
                                                                    <Text style={{}}>{parseFloatt(value['qty'])}</Text>
                                                                    <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                    <Text style={{}}>£{(value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                    <Text style={{}}>£{((((parseFloatt(value['qty']) * value['sale_price']) * 1.20)) - (parseFloatt(value['qty']) * value['sale_price'])).toFixed(2)}</Text>
                                                                    <Text style={{}}>£{(parseFloat((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)) * 1.20).toFixed(2)}</Text>
                                                                </View>
                                                            </View>
                                                            {/* <View style={{flexDirection:'row' ,justifyContent: 'space-between',marginTop: 20}}>
                                                            <Text></Text>
                                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text></Text>
                                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text>
                                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                                        </View> */}
                                                        </View>
                                                        :
                                                        <View></View>
                                                    }
                                                </View>
                                            )
                                        })

                                        :
                                        <View></View>
                                    }
                                    {(hasNonVatProducts) ?
                                        <View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text><Text style={{ fontWeight: 'bold' }}>Amount Before VAT:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VATTotal).toFixed(2)}</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text>
                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text> */}
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text><Text style={{ fontWeight: 'bold' }}>VAT:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text> */}
                                                <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VatProductTotal - VATTotal).toFixed(2)}</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal).toFixed(2)}</Text></Text> */}
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                <Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Totall:</Text> £{totalAmountVat.toFixed(2)}</Text> */}
                                                <Text ><Text style={{ fontWeight: 'bold' }}>Total:</Text></Text>
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}></Text> </Text> */}
                                                {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VATTotal).toFixed(2)}</Text></Text>
                                            <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}> £{(VatProductTotal-VATTotal).toFixed(2)}</Text></Text> */}
                                                <Text style={{ marginRight: 20 }}><Text style={{ fontWeight: 'bold' }}> £{(VatProductTotal).toFixed(2)}</Text></Text>
                                            </View>
                                        </View>
                                        :
                                        <View></View>
                                    }

                                    {(WithoutVatProductTotal > 0) ?
                                        <View>
                                            <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 10 }}>*******************************</Text>
                                            {/* <View style={{marginTop: 20,paddingTop: 10,borderTopColor: 'black', borderTopWidth: 1}}><Text style={{justifyContent: 'center',textAlign: 'center',fontWeight:'bold'}}>Items with VAT</Text></View> */}
                                            <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', borderTopColor: 'black', borderTopWidth: 1, paddingHorizontal: 20, borderBottomColor: 'black', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                                <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                                <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                                {/* <Text style={{fontWeight: 'bold'}}>VAT</Text> */}
                                                <Text style={{ fontWeight: 'bold' }}>Amt(inc)</Text>
                                            </View>
                                            <View style={{ marginTop: 10 }}>
                                            </View>
                                        </View>
                                        :
                                        <View></View>
                                    }

                                    {(savedOrderResonce != undefined) ?
                                        savedOrderResonce.map((value, key) => {
                                            return (
                                                <View key={key} >
                                                    {(value['sale_item_rel'].category_name != 'EGGS' && !value.has_vat) ?
                                                        <View key={key} style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                            <Text style={{ width: '100%', marginLeft: 20 }}><Text style={{ fontWeight: 'bold' }}></Text>{value['sale_item_rel'].name}</Text>
                                                            <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                {/* <Text style={{ }}>{(parseIntt(value['qty']))}</Text> */}
                                                                <Text style={{}}>{(parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                <Text style={{}}>£{(value['sale_price'])}</Text>
                                                                {/* <Text style={{ }}>£ 0</Text> */}
                                                                <Text style={{}}>£{((value['sale_price'] * parseFloatt(value['qty'])).toFixed(2)).toString()}</Text>
                                                            </View>
                                                            {/* <View key={key} style={{flex: 0.2,flexDirection: 'row',justifyContent:'space-between',paddingHorizontal: 20}}>
                                                            <Text style={{ width: 90}}>{}</Text>
                                                            <Text style={{ }}>{}</Text>
                                                            <Text style={{ fontWeight: 'bold'}}>VAT</Text>
                                                            <Text style={{ }}>£{((value['sale_price']*100) / 120).toFixed(2)}</Text>
                                                        </View> */}

                                                        </View>
                                                        :
                                                        <View></View>
                                                    }
                                                </View>
                                            )
                                        })
                                        :
                                        <View></View>
                                    }
                                    {(WithoutVatProductTotal > 0) ?
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                            <Text></Text>
                                            {/* <Text style={{marginRight: 20}}><Text style={{fontWeight: 'bold'}}>Total:</Text> £{(totalAmountWithoutVat).toFixed(2)}</Text> */}
                                            <View style={{ marginRight: 20 }}>
                                                <Text style={{ fontWeight: 'bold' }}>Total: £{(WithoutVatProductTotal).toFixed(2)}</Text>
                                            </View>
                                        </View>
                                        :
                                        <View></View>
                                    }
                                    <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 }}>
                                        <Text style={{ fontWeight: 'bold', width: 100 }}></Text>
                                        <Text style={{ fontWeight: 'bold' }}></Text>
                                        <Text style={{ fontWeight: 'bold' }}>Grand Total:</Text>
                                        <Text style={{ fontWeight: 'bold' }}>£{(VatProductTotal + WithoutVatProductTotal).toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, width: '100%' }}>
                                        <Text style={{ fontWeight: 'bold', width: '20%' }}>Remark:</Text>
                                        <Text style={{ width: '70%' }}> {(savedOrderResonce != undefined) ? savedOrderResonce[0]?.sale_signature_remarks?.remarks : ''} </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, width: '100%' }}>
                                        <Text style={{ fontWeight: 'bold', width: '20%' }}>Signature:</Text>
                                        {(savedOrderResonce != undefined) ?
                                            <Image style={{ width: '70%', height: 200 }} source={{ uri: `data:image/jpeg;base64,${savedOrderResonce[0]?.sale_signature_remarks?.signature}` }} />

                                            : null}
                                    </View>

                                    {(undeliveredItems != undefined) ?
                                        (undeliveredItems.length > 0) ?
                                            <View>
                                                <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 10 }}>******** <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Un Delivered</Text> ********</Text>
                                                <View style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', borderTopColor: 'black', borderTopWidth: 1, paddingHorizontal: 20, borderBottomColor: 'black', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: 1, padding: 10 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>Name</Text>
                                                    {/* <Text style={{fontWeight: 'bold'}}>Price</Text> */}
                                                    {/* <Text style={{fontWeight: 'bold'}}>VAT</Text> */}
                                                    <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                                </View>
                                                <View style={{ marginTop: 10 }}>
                                                </View>

                                                {undeliveredItems.map((value, key) => {
                                                    return (
                                                        <View key={key} >
                                                            <View key={key} style={{ borderBottomColor: '#ededed', borderBottomWidth: 1, paddingVertical: 15 }}>
                                                                <View key={key} style={{ flex: 0.2, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                                                                    {/* <Text style={{ width: '100%',marginLeft: 20}}><Text style={{ fontWeight: 'bold' }}></Text>{value['sale_item_rel'].name}</Text> */}

                                                                    <Text style={{}}>{value['sale_item_rel'].name}</Text>
                                                                    <Text style={{}}>{(parseFloatt(value['qty'])).toFixed(2)}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    )
                                                })}
                                            </View>

                                            : null
                                        :
                                        null
                                    }

                                </View>
                            </ScrollView>

                        </View>
                    </View>

            }
        </View>

    );
}
const styles = StyleSheet.create({
    bodyContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff'
        // justifyContent: 'space-around',
    },
    container: {
        // alignItems: 'center',
        height: 200,
        padding: 10,
        flex: 1
    },
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
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
        color: 'white',
        fontSize: 12
    },
    deActiveStatusText: {
        color: Colors.primary,
        fontSize: 12
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
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 15
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    buttonClose: {
        backgroundColor: Colors.primary,
    },
});