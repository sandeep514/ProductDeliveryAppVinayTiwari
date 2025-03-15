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
import { colors } from 'react-native-elements';

export default function PreviewPDF({ navigation, route }) {
    const [selectedItems, setSelectedItems] = useState({});
    const [html, setHtml] = useState();

    useEffect(() => {
        console.log(route?.params?.items)
        setSelectedItems(route?.params?.items);
        let datause = route?.params?.items;

        if (datause) {
            let data2 = (Object.values(datause));

            let availableKeys = [];
            let htmlContent = [];
            for (let i = 0; i < data2.length; i++) {
                let leng1 = Object.values(data2[i]);
                for (let j = 0; j < leng1.length; j++) {

                    if (!availableKeys.includes((leng1[j]['category_rel']['cate']))) {
                        availableKeys.push((leng1[j]['category_rel']['cate']));
                        htmlContent.push("<div><div><h1 style='background: skyblue;padding: 15px;margin: 0;'>" + (leng1[j]['category_rel']['cate']) + "</h1></div>");
                    }

                    htmlContent.push("<div style='float: left;padding: 20px;width: 150px;height: 155px;background-color: #ededed'><div style='text-align: center;align-item: center'><img src='" + imagePrefix + '/' + leng1[j]['img'] + "' style='width: 80px;height: 80px'/></div><div><p style='text-align: center'>" + leng1[j]['name'] + "</p></div><div><p style='text-align: center;font-weight: bold'>£ " + leng1[j]['updatedPDFPrice'] + "</p></div></div>");
                }
                htmlContent.push("</div>");
            }
            setHtml(htmlContent)
        }
    }, [])


    const printPDF = (() => {

        let htmlCont = '<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title></title> </head> <body style="display: grid;"> <div><h2 style="text-align: center;font-size:30px">Sun Farms</h2></div>' + html + '</body> </html>';

        RNPrint.print({
            html: htmlCont.replaceAll('</div>,', '</div>')
            // isLandscape: true
        });
    });

    return (
        <MainScreen>
            <ScrollView >
                <View style={{}}>
                    {Object.keys(selectedItems).map((item, index) => {
                        return (
                            <View>
                                <View style={{ backgroundColor: colors.primary, paddingVertical: 10, paddingLeft: 10 }}>
                                    <Text style={[{ color: '#fff', fontSize: 30 }]}>{item}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    {Object.values(selectedItems[item]).map((item1, index1) => {
                                        return (
                                            <View style={{ width: '25%', padding: 10, backgroundColor: '#ededed', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                                <Image source={{ uri: imagePrefix + '/' + item1?.img }} style={{ width: '100%', height: 100 }} />
                                                <Text style={{ color: '#000', fontSize: 20 }}>{item1?.name}</Text>
                                                <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>£ {item1?.updatedPDFPrice}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>
            <Pressable
                onPress={() => {
                    printPDF()
                }} style={{ bottom: 10, position: 'absolute', justifyContent: 'center', padding: 10, height: 70, width: 70, backgroundColor: Colors.primary, borderRadius: 100, right: 10 }}
            >
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 25, fontWeight: 'bold' }}>PDF</Text>
            </Pressable>
        </MainScreen >
    );
}
