import React , { useEffect , useState} from 'react';
import { ActivityIndicator } from 'react-native';
import {View, Text, StyleSheet,Dimensions} from 'react-native';
import {Icon, Input, ListItem} from 'react-native-elements';

export default function ItemComponent({defaultImage , listItems , sortedItm , buyerId}) {
	const [activeIndicatorLoader , setActiveIndicatorLoader] = useState(true);
	const [sortedData , setSortedData] = useState();

    const changeText = ( text , movedBuyerId ) => {
        var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;  

        if(format.test(text) == false){
            if(  text != '' && text != NaN && text != undefined && text.length != 0){
                // console.log('-------')
                // console.log(listItems.length)
                if(isNaN(text) != true){
                    
                    if( text > listItems.length ){
                        alert(" Max Number will be "+listItems.length);
                        return false
                    }else{
                        listItems.splice( listItems.indexOf(movedBuyerId) , 1)
    
                        let checkIfAvaiable = listItems.indexOf(text);
                        let changedOrder = (text - 1);
                        let currentReplacebalebuyerId = listItems[changedOrder];
                        let beforeArray = [];
                        let replacedArray = [];
                        let afterArray = [];
                        
                        for(let i = 0 ; i < listItems.length ; i++){    
                            if( i == changedOrder ){
                                replacedArray.push( movedBuyerId )
                                replacedArray.push(currentReplacebalebuyerId)
                            }
            
                            if(i < changedOrder) {
                                beforeArray.push( listItems[i] )
                            }
                            if(i > changedOrder) {
                                afterArray.push( listItems[i] )
                            }
                        }
                        // console.log(beforeArray);
                        // console.log(replacedArray);
                        // console.log(afterArray);
                        const contacttwo = beforeArray.concat(replacedArray)
                        const contactthree = contacttwo.concat(afterArray)
                        // console.log(contactthree.length);
        
                        setSortedData(contactthree)
                        sortedItm(contactthree)
                    }
                }	
            }
        }else{
            alert('Only numaric values allowed.');
            return false;
        }
    }
    


	return (
			<Input
                allowFontScaling={false}
                onChangeText={(text) => {
                    changeText( text , buyerId)
                }}
                // onBlur={handleBlur('username')}
                // value={values.username}
                keyboardType="number-pad"
                defaultValue={defaultImage}
                style={{backgroundColor: 'white', width: 60}}
            />
	);							
}

const styles = StyleSheet.create({
  
});
