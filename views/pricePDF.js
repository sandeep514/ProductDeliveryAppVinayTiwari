import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, SectionList } from 'react-native';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { getItemsByVehicleAndLoads, imagePrefix, checkIfBuyerHasVAT } from '../api/apiService';
import { Colors } from '../components/Colors';
import ItemCard from '../components/ItemCard';
import MainScreen from '../layout/MainScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
import RNPrint from 'react-native-print';

let itemList = [

];

export default function pricePDF({ navigation, route }) {
    const [activeIndicatorLoader, setActiveIndicatorLoader] = useState(true);
    const [activeIndicatorLoaderImages, setActiveIndicatorLoaderImages] = useState(false);
    const [ListItems, setListItems] = useState({});
    const [requestSent, setRequestSent] = useState(false);
    const [hasUndeliveredItems, setHasUndeliveredItems] = useState(false);
    const [selectedItemsFromLoads, setSelectedItemsFromLoads] = useState();
    const [customerName, setCustomerName] = useState();
    const [myBuyerId, setMyBuyerId] = useState();
    const windowWidth = Dimensions.get('window').width;
    const [eggContent,] = useState();
    const [] = useState();
    const [] = useState();
    const [selectedItems, setSelectedItems] = useState({});
    const printHTML = async () => {

        let html = `<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title></title> </head> <body> <div style="margin-bottom: 50px;padding:0 50px"> <div style="margin-bottom: 50px;padding:0 50px"> <div> <h1 style="text-align: center;margin-bottom:0px;margin-top: 50px">Sun Farms</h1>  </div> <div style="display: flex;justify-content: space-between;"> <div style="align-content: center"> <p style="padding:0px;margin:0px;">Order No: <span style="font-weight: 900">${data?.Order} </span> </p> </div> <div> <p style="font-weight: bold;font-size: 25px;padding:0px;margin:0px">Dispatch advice</p> </div> <div style="align-content: center"> <p style="padding:0px;margin:0px">Date: ${new Date(data?.created_at).toLocaleDateString()} </p> </div> </div> </div> <div style="border: 1px solid #000;border-radius: 10px;margin-top: 20px;display: flex;width: 700px;"> <div style="width: 50%"> <div style="margin-bottom: 10px;padding: 10px 0px 0px 20px"> <div style="padding:0px,margin:0px"> <h5 style="font-style: italic;text-decoration:underline;font-size: 15px;text-transform: uppercase;margin-top: 5px;margin-bottom: 10px;"> Dispatch To</h5> </div> <div> <h3 style="padding:0px;margin:0px">${data?.party_details?.name}</h3> </div> <div> <h5 style="padding:0px;margin:0px">Address: ${data?.party_details?.address}</h5> </div> <div> <h5 style="padding:0px;margin:0px">GST: ${data?.party_details?.gst_no}</h5> </div> </div> <div style="border-top: 1px solid #000;padding: 10px 0px 20px 20px"> <div> <p style="padding:0px;font-size: 13px;margin:0px">Phone: ${(data?.party_details?.phone) ?? '--'}</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Mobile: ${(data?.party_details?.mobile) ?? '--'}</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Fax: ${(data?.party_details?.fax) ?? '--'}</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Tin: ${(data?.party_details?.tin) ?? '--'}</p> </div> </div> </div> <div style="width: 50%;border-left: 1px solid;"> <div style="margin-bottom: 10px;padding: 10px 0px 0px 20px"> <div style="padding:0px,margin:0px"> <h5 style="font-style: italic;text-decoration:underline;font-size: 15px;text-transform: uppercase;margin-top: 5px;margin-bottom: 10px;"> Order Of:</h5> </div> <div> <h5 style="padding:0px;margin:0px">created by</h5> </div> <div> <h5 style="padding:0px;margin:0px">Address</h5> </div> <div> <h5 style="padding:0px;margin:0px">GST</h5> </div> </div> <div style="border-top: 1px solid #000;padding: 10px 0px 20px 20px;"> <div> <p style="padding:0px;font-size: 13px;margin:0px">Phone:</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Mobile:</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Fax:</p> </div> <div> <p style="padding:0px;font-size: 13px;margin:0px">Tin:</p> </div> </div> </div> </div> <div> <div> <table style="border: 1px solid #000;border-collapse: collapse;"> <thead style="border-bottom: 1px solid #000;flex-direction: row;"> <tr> <th style="border-right: 1px solid #000;width: 30px;max-width: 30px;"> <div style="font-size: 15px;padding: 10px 0px">Sno</div> </th> <th style="border-right: 1px solid #000;width: 160px;max-width: 160px;"> <div style="font-size: 15px;padding: 10px 0px">Quality</div> </th> <th style="border-right: 1px solid #000;width: 50px;max-width: 50px;"> <div style="font-size: 15px;padding: 10px 0px">lot no</div> </th> <th style="border-right: 1px solid #000;width: 80px;max-width: 80px;"> <div style="font-size: 15px;padding: 10px 0px">packing</div> </th> <th style="border-right: 1px solid #000;width: 80px;max-width: 80px;"> <div style="font-size: 15px;padding: 10px 0px">Bags/pcs</div> </th> <th style="border-right: 1px solid #000;width: 80px;max-width: 80px;"> <div style="font-size: 15px;padding: 10px 0px">Weight</div> </th> <th style="border-right: 1px solid #000;width: 80px;max-width: 80px;"> <div style="font-size: 15px;padding: 10px 0px">Rate</div> </th> <th style="width: 80px;max-width: 80px"> <div style="font-size: 15px;padding: 10px 0px;">Amount</div> </th> </tr> </thead> <tbody style="border-bottom: 1px solid #000;flex-direction: row;"> ${data?.purchase_order_details.map((item, index) => ` <tr> <td style="border-right: 1px solid #000;width: 30px;max-width: 30px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${(index + 1)}</div> </td> <td style="border-right: 1px solid #000;width: 160px;max-width: 160px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px;font-weight: bold">${item?.rice_name_details?.name} ${item?.rice_form_details?.form_name} <br> <div style="font-style= 'italic' ">${(item?.get_brand_detail?.name) ?? ''} </div> </div> </td> <td style="border-right: 1px solid #000;width: 50px;max-width: 50px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${item?.lotNo}</div> </td> <td style="border-right: 1px solid #000;width: 80px;max-width: 80px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${item?.packing_details?.code}</div> </td> <td style="border-right: 1px solid #000;width: 80px;max-width: 80px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${item?.bags}</div> </td> <td style="border-right: 1px solid #000;width: 80px;max-width: 80px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${Number(item?.weight).toFixed(2)}</div> </td> <td style="border-right: 1px solid #000;width: 80px;max-width: 80px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${item?.rate}</div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;text-align: center;padding: 10px 0px">${(item?.amount) ? ((Number(item?.amount)).toFixed(2)) : '--'}</div> </td> </tr> `,).join('')}' </tbody> <tfoot style=""> <tr> <td style="width: 30px;max-width: 30px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;"></div> </td> <td style="width: 160px;max-width: 160px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;"></div> </td> <td style="width: 50px;max-width: 50px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;">Total</div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;"></div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;text-align: center;">${totalBags}</div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;text-align: center;">${Number(totalWeight).toFixed(2)}</div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;"></div> </td> <td style="width: 80px;max-width: 80px"> <div style="font-size: 15px;font-weight: 900;padding: 10px 0px;text-align: center;">${Number(totalAmount).toFixed(2)}</div> </td> </tr> </tfoot> </table> </div> <div> <div> <p> <span style="font-weight: bold;font-size: 15px;">Terms & condition: </span> <span style="font-size: 15px;">${data?.additionalInfo}</span> </p> </div> </div> <div> ${htmldata} </div> </div> </div> </body> </html>`
        await RNPrint.print({
            html: html,
            isLandscape: true
        });
    };

    useEffect(() => {
        AsyncStorage.setItem('selectedLoadedItemsByQty', JSON.stringify({}));
        AsyncStorage.getItem('selectedBuyerRouteId').then((buyerId) => {
            checkIfBuyerHasVAT(buyerId).then((res) => {
                // AsyncStorage.setItem('currentVATstatus' , status);
                AsyncStorage.setItem('VATStatus', (res.data.message).toString());
            });
        })
        getItems();
    }, []);

    function getItems() {
        AsyncStorage.getItem('selectedVehicleNo').then((value) => {
            let vehicheId = value;
            AsyncStorage.getItem('selectedLoadsNumbers').then((value) => {
                let load_numbers = value;
                getItemsByVehicleAndLoads(vehicheId, load_numbers).then((res) => {
                    // console.log('res.data.data')
                    // console.log(res.data.data['LOAD-27-12-2022-300']);
                    setListItems(res.data.data);

                    setActiveIndicatorLoader(false);
                    setActiveIndicatorLoaderImages(true)
                    setTimeout(() => {
                        setActiveIndicatorLoaderImages(false)
                    }, 8000)
                }, (err) => {
                    setActiveIndicatorLoader(false);
                });
            });
        });
    }

    useEffect(() => {
        let datause = ListItems;
        if (datause) {
            let data2 = (Object.values(datause));
            let availableKeys = [];
            let htmlContent = [];
            for (let i = 0; i < data2.length; i++) {
                let leng1 = Object.values(data2[i]);
                for (let j = 0; j < leng1.length; j++) {
                    for (let p = 0; p < Object.values(leng1[j]).length; p++) {
                        if (!(Object.values(leng1[j])[p]['category_rel']['cate']) in availableKeys) {
                            availableKeys.push((Object.values(leng1[j])[p]['category_rel']['cate']));
                            htmlContent.push("<div>`${(Object.values(leng1[j])[p]['category_rel']['cate'])}`</div>");
                        }
                        htmlContent.push("<div style='float: left;padding: 20px;width: 150px;height: 155px'><div style='text-align: center;align-item: center'><img src='" + imagePrefix + '/' + Object.values(leng1[j])[p]['img'] + "' style='width: 80px;height: 80px'/></div><div><p style='text-align: center'>" + Object.values(leng1[j])[p]['name'] + "</p></div><div><p style='text-align: center;font-weight: bold'>" + Object.values(leng1[j])[p]['sale_price'] + "</p></div></div>");
                        // if ((Object.values(leng1[j])[p]['category_rel']['cate']) == 'EGGS') {
                        //     EggContent.push({ img: Object.values(leng1[j])[p]['img'], name: Object.values(leng1[j])[p]['name'], sale_price: Object.values(leng1[j])[p]['sale_price'] });
                        // }
                        // if ((Object.values(leng1[j])[p]['category_rel']['cate']) == 'RIZLA') {
                        //     RizlaContent.push({ img: Object.values(leng1[j])[p]['img'], name: Object.values(leng1[j])[p]['name'], sale_price: Object.values(leng1[j])[p]['sale_price'] });
                        // }
                        // if ((Object.values(leng1[j])[p]['category_rel']['cate']) == 'PACKAGING') {
                        //     PackingContent.push({ img: Object.values(leng1[j])[p]['img'], name: Object.values(leng1[j])[p]['name'], sale_price: Object.values(leng1[j])[p]['sale_price'] });
                        // }
                        // console.log(Object.values(leng1[j])[p]['category_rel']['cate']);
                        // htmlContent[Object.values(leng1[j])[p]['category_rel']['cate']].push({ img: Object.values(leng1[j])[p]['img'], name: Object.values(leng1[j])[p]['name'], sale_price: Object.values(leng1[j])[p]['sale_price'] });
                    }
                }
            }

            setTimeout(() => {
                // let html = '<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title></title> </head> <body> <div><h2 style="text-align: center;font-size:30px">Sun Farms</h2></div>' + htmlContent + '</body> </html>';
                // RNPrint.print({
                //     html: html.replaceAll('</div>,', '</div>')
                //     // isLandscape: true
                // });
            }, 5000);
        }

    }, [ListItems]);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <FlatList
                data={Object.values(item.items)}
                numColumns={4}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handlePress(item)}
                        style={[
                            styles.pressable, ((selectedItems[item?.category_rel?.cate]) ? (selectedItems[item?.category_rel?.cate][item.id]) ? { backgroundColor: Colors.primary } : {} : {})
                        ]}
                    >
                        <View style={styles.itemInnerContainer}>
                            <Image source={{ uri: `${imagePrefix}${item.img}` }} style={styles.image} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>£ {item.sale_price}</Text>
                                <TextInput onPressIn={() => {
                                    handlePress(item);
                                }} style={{ color: '#000', borderWidth: 2, borderColor: '#000', textAlign: 'center', fontSize: 22, fontWeight: 'bold' }} keyboardType='numeric' onChangeText={(event) => {
                                    // console.log(ListItems);
                                    console.log(item)
                                    selectedItems[item?.category_rel?.cate][item?.id]['updatedPDFPrice'] = event;
                                    console.log(selectedItems)
                                }} />
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
    // Flatten the nested ListItems object for easier rendering in FlatList
    const flattenedList = Object.keys(ListItems).reduce((acc, key) => {
        Object.keys(ListItems[key]).forEach((k) => {
            acc.push({ title: k, items: ListItems[key][k] });
        });
        return acc;
    }, []);

    const handlePress = (item) => {
        let selectedData = { ...selectedItems };
        const currentKey = item.id;

        let category = item?.category_rel?.cate;
        if (selectedData[category] == undefined) {
            selectedData[category] = {};
            selectedData[category][currentKey] = item;
        } else {
            if (currentKey in selectedData[category]) {
                console.log("here i am tere");
                delete selectedData[category][currentKey];
            } else {
                console.log("i");
                selectedData[category][currentKey] = item;
            }
        }
        console.log("hellol");
        console.log(selectedData)
        setSelectedItems(selectedData);
    };

    return (
        <MainScreen>
            <ScrollView vertical="true" >
                {(activeIndicatorLoader == true) ?
                    <ActivityIndicator size="large" color="#6c33a1" />
                    :
                    null
                }


                {(ListItems != undefined) ?
                    <FlatList
                        data={flattenedList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                    />
                    :
                    <Text></Text>
                }

            </ScrollView>


            <Pressable
                onPress={() => {
                    navigation.navigate('previewPDF', { items: selectedItems });
                }} style={{ bottom: 10, position: 'absolute', justifyContent: 'center', padding: 10, height: 70, width: 70, backgroundColor: Colors.primary, borderRadius: 100, right: 10 }}
            >
                <Icon name='arrow-right' type='font-awesome' style={{ fontSize: 25, color: 'white', textAlign: 'center' }} />
            </Pressable>
        </MainScreen >
    );
}
const styles = StyleSheet.create({
    itemContainer: {
        marginBottom: 85,
    },
    sectionTitle: {
        paddingHorizontal: 13,
        paddingVertical: 10,
        backgroundColor: '#ededed',
        fontSize: 18,
        marginTop: 30,
        color: '#000',
    },
    pressable: {
        width: '20%',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    itemInnerContainer: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 150,
    },
    itemInfo: {
        backgroundColor: '#ededed',
        width: '100%',
        paddingVertical: 10,
    },
    itemName: {
        textAlign: 'center',
        color: '#000',
        fontSize: 18,
    },
    itemPrice: {
        textAlign: 'center',
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
