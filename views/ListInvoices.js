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
import { ListItem, Avatar, Header, Button, Input } from 'react-native-elements';
import MainScreen from '../layout/MainScreen';
import { useState, useEffect } from 'react';
import { getBuyerInvoices, updateTypeOfinvoice } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const win = Dimensions.get('window');

export default function ListInvoices({ navigation, route }) {
    const [printingIndicator, setPrintingIndicator] = useState(false);
    const [selectedLoadCount, setSelectedLoadCount] = useState();
    const [TotalInvoiceNumber, setTotalInvoiceNumber] = useState(0);
    const [ActInd, setActInd] = useState();

    useEffect(() => {
        getListInvoice(route.params.buyerId);
        AsyncStorage.setItem('setBuyerIdData', (route.params.buyerId).toString());

    }, []);

    function getListInvoice(buyerId) {
        getBuyerInvoices(buyerId).then((data) => {
            setSelectedLoadCount(data.data.invoices)
            setTotalInvoiceNumber(data.data.totalOfAllInvoices)
        });
    }
    function changeStatusOfInvoice(invoiceNumber, type) {
        setPrintingIndicator(true);
        updateTypeOfinvoice(invoiceNumber, type).then((res) => {
            AsyncStorage.getItem('setBuyerIdData').then((myBuyerId) => {
                getListInvoice(myBuyerId)
                setPrintingIndicator(false)
            })
        }, (err) => {
            setPrintingIndicator(false)
        })
    }
    function ViewPrintableReciept(data) {

        navigation.navigate('ViewPDF', { invoiceNo: data[0].invoice })
    }
    return (
        <MainScreen>
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
                                <Text>Updating Record, Please wait...</Text>
                            </View>
                            :
                            <View></View>
                        }
                        {/* <TextInput placeholder="Search Buyer By Invoice no" placeholderTextColor="lightgrey" style={styles.textInput} onChange={(value) => { searchBuyer(value.nativeEvent.text) } } /> */}
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'right', color: Colors.primary, fontSize: 22, marginRight: 20 }}>Total: £<Text style={{}}>{(TotalInvoiceNumber.toFixed(2))}</Text></Text>
                        </View>
                        <ScrollView vertical='true'>
                            {(selectedLoadCount != undefined && selectedLoadCount != null) ?
                                Object.values(selectedLoadCount).map((l, i) => (
                                    (l != null) ?
                                        <TouchableHighlight key={i}>
                                            <ListItem bottomDivider key={i}>

                                                <ListItem.Content key={i}>
                                                    <ListItem.Title key={i} style={{ fontSize: 14 }} allowFontScaling={false}>
                                                        <Pressable onPress={() => { ViewPrintableReciept(l) }}>
                                                            <Text style={{ fontSize: 15 }}>{l[0].buyer_rel['name']} </Text>
                                                        </Pressable>
                                                    </ListItem.Title>

                                                    <ListItem.Subtitle allowFontScaling={false} >
                                                        ( <Text style={{ fontSize: 16 }}>{l[0].invoice}</Text> )
                                                        <Text style={{ fontSize: 13 }}>  £{l.invoiceTotal} </Text>
                                                        <Text style={{ fontSize: 10 }}> {l[0].ddate} </Text>
                                                    </ListItem.Subtitle>
                                                </ListItem.Content>
                                                <View>
                                                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}> Clossing balance: £{(l.closingBalance).toFixed(2)}</Text>
                                                </View>
                                                <View>
                                                    <Pressable style={{ backgroundColor: 'skyblue', paddingHorizontal: 10, paddingVertical: 5 }} onPress={() => { ViewPrintableReciept(l) }} >
                                                        <Text style={{ color: 'white' }}>View</Text>
                                                    </Pressable>
                                                </View>


                                                <View>
                                                    <Pressable style={(l[0].payment_type == 'cash') ? { backgroundColor: 'green', paddingHorizontal: 10, paddingVertical: 5 } : { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5 }} onPress={() => { changeStatusOfInvoice(l[0].invoice, 'cash') }} >
                                                        <Text style={{ color: 'white' }}>Cash</Text>
                                                    </Pressable>
                                                </View>

                                                <View>
                                                    <Pressable style={(l[0].payment_type == 'credit') ? { backgroundColor: 'green', paddingHorizontal: 10, paddingVertical: 5 } : { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5 }} onPress={() => { changeStatusOfInvoice(l[0].invoice, 'credit') }} >
                                                        <Text style={{ color: 'white' }}>Credit</Text>
                                                    </Pressable>
                                                </View>

                                                <View>
                                                    <Pressable style={(l[0].payment_type == 'bank') ? { backgroundColor: 'green', paddingHorizontal: 10, paddingVertical: 5 } : { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5 }} onPress={() => { changeStatusOfInvoice(l[0].invoice, 'bank') }} >
                                                        <Text style={{ color: 'white' }}>Bank Transfer</Text>
                                                    </Pressable>
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
                        </ScrollView>

                    </View>
                }
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
    }
});