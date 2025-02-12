import React, { useRef ,useState,useEffect} from 'react'
import { Easing } from 'react-native'
import { Animated, Modal, StyleSheet, Text, View } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { base_url } from '../../api/config'
import { screenSize } from '../../util/screenSize'

import CachedImage from '../NonIdCachedImage'
import Comment from '../../pages/Comment'
const index = ({  item , index, navigation  }) => {
    
    //console.log('mini',item)
    const ref = useRef()
    
    const [isClick, setIsClick] = useState(false)

    const scaleX = useRef(new Animated.Value(138)).current

    const scaleY = useRef(new Animated.Value(138)).current


    const translateX = useRef(new Animated.Value(0)).current

    const translateY = useRef(new Animated.Value(0)).current

    const initPosition = useRef({width:0,height:0,pageX:0,pageY:0 })


    const route = {
        params:{
            userId:item.userId,
            postId:item.id,
            item:item
        }
    }


    const viewZooming=()=>{
        
        //console.log(translateX,translateY)
        
        
            Animated.parallel([
                Animated.timing(scaleX,{
                    toValue:screenSize.width,
                    useNativeDriver:false,
                    easing:Easing.linear,
                    duration:300,
                }),
                Animated.timing(scaleY,{
                    toValue:screenSize.height,
                    useNativeDriver:false,
                    easing:Easing.linear,
                    duration:300,
                    
                }),
                Animated.timing(translateX,{
                    toValue:0,
                    useNativeDriver:false,    
                    easing:Easing.linear,
                    duration:300,
               
                }),
                Animated.timing(translateY,{
                    toValue:0,
                    useNativeDriver:false,  
                    easing:Easing.linear, 
                    duration:300,
                })
            ],{stopTogether:false}).start()        

        
    }

    const viewCollapseZooming=()=>{
       // setShowModalBackground(()=>false)

       Animated.parallel([
        Animated.timing(scaleX,{
            toValue:initPosition.current.width,
            useNativeDriver:false,
            easing:Easing.linear,
            duration:250,
        }),

        Animated.timing(scaleY,{
            toValue:initPosition.current.height,
            useNativeDriver:false,
            easing:Easing.linear,
            duration:250,
        }),

        Animated.timing(translateX,{
            toValue:initPosition.current.pageX,
            useNativeDriver:false,
            easing:Easing.linear,
            duration:250,
        }),

        Animated.timing(translateY,{
            toValue:initPosition.current.pageY,
            useNativeDriver:false,
            easing:Easing.linear,
            duration:250,
        })
       ],{stopTogether:false}).start()
        


        setTimeout(()=>{
            setIsClick(()=>false)
        },250)
    }


    useEffect(() => {
        if(isClick){
            //console.log('zooming'
            viewZooming()
        }
    }, [isClick])

    return (
        <View >
            { 
                <Modal   visible={isClick} 
                style={{
                width:screenSize.width,
                height:screenSize.height,zIndex:1,
                borderRadius:40}} 
                transparent={true}>
                    <Animated.View 
                    //onLayout={e=>console.log(e.nativeEvent.layout)}
                    style={{
                        borderRadius:20,
                        width:scaleX,
                        height:scaleY,
                        /* backgroundColor:"rgba(0,0,0,0.4)" */
                        overflow:'hidden',
                        transform:[
                        /* {scale:scaleX}, */
                        {translateX:translateX},
                        {translateY:translateY},
                        /* {translateY:translateY}, */
                        /* {translateY:200}, */
                        /* {scaleY:scaleY} */],
                        /* backgroundColor:"#FFFFFF", */
                        
                    }} 
                    onTouchStart={()=>{
                        //viewCollapseZooming()
                    }}>
                        <Comment moveable={true} collapse={viewCollapseZooming} delayLoading={false} route={route} navigation={navigation} />


                    </Animated.View >
                </Modal>
            }


            <TouchableHighlight style={{zIndex:0}} activeOpacity={0.7} underlayColor={"#FFFFFF"} 
            onPress={()=>{       
                ref.current.measure((x,y,width,height,pageX,pageY)=>{
                    //console.log(x,y,width,height,pageX,pageY,screenSize.width/width,screenSize.height/height);
                    initPosition.current={
                        width,
                        height,
                        pageX,
                        pageY
                    }
                    Animated.timing(translateY,{
                        toValue:pageY,
                        duration:0,
                        useNativeDriver:false
                    }).start()
                    Animated.timing(translateX,{
                        toValue:pageX,
                        duration:0,
                        useNativeDriver:false
                    }).start()

                    //console.log(translateX,translateY)


                    setIsClick(()=>true)


                });

                
                /* setTranslateX(()=>styles.image.width/(screenSize.width/styles.image.width))
                setTranslateY(()=>styles.image.height/(screenSize.height/styles.image.height)) */
                
                

                //viewZooming()
            /* navigation.navigate('comment',{
                item:item,
                userId:item.userId,
                postId:item.id
            }) */

            }} >
                <View  ref={c=>ref.current=c} style={styles.container}>
                    <CachedImage style={styles.image} uri={item.postImage[0]} />
                </View>
            </TouchableHighlight>
        </View>
    )
}

export default index

const styles = StyleSheet.create({
    container:{
        width:(screenSize.width)/3,
        marginRight:2,
        marginBottom:2
    },
    image:{
        width:(screenSize.width)/3,
        height:(screenSize.width)/3
    }
})
